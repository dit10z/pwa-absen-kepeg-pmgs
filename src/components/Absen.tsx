import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckAbsenRequest } from "../types/requests/check-absen";
import { useAuthStore } from "../store/auth-store";
import {
  postCheckAbsen,
  postUploadPhoto,
  postAbsenUpload,
  getRefKelainan,
} from "../queries/absenQueryFn";
import Webcam from "react-webcam";

interface AbsenCardProps {
  date: string;
  currentTime: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  is_absen_in: number;
  is_absen_out: number;
}

const AbsenCard: React.FC<AbsenCardProps> = ({
  date,
  currentTime,
  is_absen_in,
  is_absen_out,
}) => {
  const { token } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [absenType, setAbsenType] = useState<0 | 1 | null>(null); // 1: Masuk, 0: Pulang
  const [location, setLocation] = useState<0 | 1 | null>(null); // 1: Kantor, 0: Luar
  const [latitude, setLatitude] = useState<string>("0");
  const [longitude, setLongitude] = useState<string>("0");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<string | null>(null);
  const [capturedLetter, setCapturedLetter] = useState<string | null>(null);
  const [filenames, setFilenames] = useState<{
    filename_image: string;
    filename_location: string;
    filename_letter: string;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "face" | "location" | "letter"
  >("face"); // Track current step

  const [isLate, setIsLate] = useState<boolean>(false);
  const [showKelainanModal, setShowKelainanModal] = useState<boolean>(false);
  const [kelainanOptions, setKelainanOptions] = useState<any[]>([]); // Store fetched kelainan options
  const [selectedKelainan, setSelectedKelainan] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  const fetchKelainanOptions = async () => {
    try {
      const data = await getRefKelainan();
      console.log("Fetched Kelainan Options:", data); // Log the response
      setKelainanOptions(data); // Store the fetched kelainan options
    } catch (err) {
      console.error("Failed to fetch kelainan options:", err);
      alert("Gagal mengambil data kelainan.");
    }
  };

  // Mutation for handling the API call
  const { mutate: checkAbsen, isPending: isCheckPending } = useMutation({
    mutationFn: (data: CheckAbsenRequest) => postCheckAbsen(data),
    onSuccess: (data) => {
      console.log("Check absen successful:", data);

      if (data.is_late === 1) {
        setIsLate(true); // Set isLate to true
        fetchKelainanOptions(); // Fetch kelainan options
        setShowKelainanModal(true); // Show the kelainan modal
      } else {
        setShowModal(false); // Close the location modal
        setShowCameraModal(true); // Open the camera modal
        setCurrentStep("face"); // Start with face capture
      }
    },
    onError: (err: Error) => {
      console.error("Absen failed:", err.message);
      alert(`Absen gagal: ${err.message}`);
    },
  });

  // Mutation for uploading the photo
  const { mutate: uploadPhoto, isPending: isUploadPending } = useMutation({
    mutationFn: (formData: FormData) => postUploadPhoto(formData),
    onSuccess: (data) => {
      console.log("Upload successful:", data);

      // Use the correct field from the response
      const filenames = {
        filename_image: data.filename_image,
        filename_location: data.filename_location,
        filename_letter: data.filename_letter,
      };

      setFilenames(filenames); // Save the filenames for the next API call
      handleAbsenUpload(filenames); // Call the absen-upload API
    },
    onError: (err: Error) => {
      console.error("Upload failed:", err.message);
      alert(`Upload foto gagal: ${err.message}`);
    },
  });

  // Mutation for absen-upload API
  const { mutate: absenUpload, isPending: isAbsenUploadPending } = useMutation({
    mutationFn: (data: any) => postAbsenUpload(data),
    onSuccess: (data) => {
      console.log("Absen upload successful:", data);
      alert("Absen berhasil!");
      setShowCameraModal(false); // Close the camera modal
    },
    onError: (err: Error) => {
      console.error("Absen upload failed:", err.message);
      alert(`Absen upload gagal: ${err.message}`);
    },
  });

  // Handle Absen button click
  const handleAbsenClick = (type: 0 | 1) => {
    setAbsenType(type);
    setShowModal(true); // Show the modal for location selection
  };

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      if (currentStep === "face") {
        setCapturedFace(imageSrc);
        if (location === 1) {
          // If location is "Kantor", skip location and letter steps
          setShowCameraModal(false);
          handleUploadPhoto();
        } else {
          setCurrentStep("location"); // Move to location step
        }
      } else if (currentStep === "location") {
        setCapturedLocation(imageSrc);
        setCurrentStep("letter"); // Move to letter step
      } else if (currentStep === "letter") {
        setCapturedLetter(imageSrc); // Set capturedLetter and let useEffect handle the rest
      }
    }
  }, [currentStep, location]);

  useEffect(() => {
    if (currentStep === "letter" && capturedLetter) {
      setShowCameraModal(false); // Close the camera modal
      handleUploadPhoto(); // Upload all photos
    }
  }, [capturedLetter, currentStep]);

  // Handle location selection
  //   const handleLocationSelect = async (selectedLocation: 0 | 1) => {
  //     setLocation(selectedLocation);

  //     let lat = "0";
  //     let long = "0";

  //     if (selectedLocation === 1) {
  //       try {
  //         const position = await getCurrentPosition();
  //         lat = position.coords.latitude.toString();
  //         long = position.coords.longitude.toString();
  //         setGeolocationError(null);
  //       } catch (err) {
  //         setGeolocationError("Gagal mendapatkan lokasi perangkat.");
  //         return;
  //       }
  //     }

  //     setLatitude(lat);
  //     setLongitude(long);

  //     const data: CheckAbsenRequest = {
  //       type: absenType!,
  //       location: selectedLocation,
  //       latitude: lat, // Use updated lat
  //       longitude: long, // Use updated long
  //     };

  //     checkAbsen(data);
  //   };

  const handleLocationSelect = async (selectedLocation: 0 | 1) => {
    setLocation(selectedLocation);

    // Static latitude and longitude
    const lat = "-6.778739706289086";
    const long = "107.4883826256423";

    setLatitude(lat);
    setLongitude(long);
    setGeolocationError(null); // Clear any previous errors

    const data: CheckAbsenRequest = {
      type: absenType!,
      location: selectedLocation,
      latitude: lat,
      longitude: long,
    };

    checkAbsen(data);
  };

  // Handle photo upload
  const handleUploadPhoto = () => {
    console.log("Captured Face:", capturedFace);
    console.log("Captured Location:", capturedLocation);
    console.log("Captured Letter:", capturedLetter);
    console.log("Location:", location);

    // Validate required photos
    if (!capturedFace) {
      alert("Silakan ambil foto wajah terlebih dahulu.");
      return;
    }

    const formData = new FormData();

    // Ensure filename_image is uploaded regardless of location
    const faceFile = dataURLtoFile(capturedFace, "face.jpg");
    if (faceFile) {
      formData.append("filename_image", faceFile);
    } else {
      console.error("Failed to process face image");
      alert("Terjadi kesalahan saat memproses foto wajah.");
      return;
    }

    formData.append("type", absenType?.toString() || "");

    // Only append location and letter photos if location === 0 (Luar Kantor)
    if (location === 0) {
      if (!capturedLocation || !capturedLetter) {
        alert("Silakan ambil foto lokasi dan surat terlebih dahulu.");
        return;
      }

      const locationFile = dataURLtoFile(capturedLocation, "location.jpg");
      const letterFile = dataURLtoFile(capturedLetter, "letter.jpg");

      if (locationFile) formData.append("filename_location", locationFile);
      if (letterFile) formData.append("filename_letter", letterFile);
    }

    uploadPhoto(formData);
  };

  // Handle absen-upload API call
  const handleAbsenUpload = (filenames: {
    filename_image: string;
    filename_location: string;
    filename_letter: string;
  }) => {
    const data = {
      latitude: latitude,
      longitude: longitude,
      filename_face: filenames.filename_image,
      filename_location:
        location === 1 ? "no_picture.jpg" : filenames.filename_location,
      filename_letter:
        location === 1 ? "no_picture.jpg" : filenames.filename_letter,
      type: absenType?.toString() || "",
      location: location?.toString() || "",
      device_token: token || "''",
      kelainan: selectedKelainan || "", // Include selected kelainan
    };

    console.log("Sending Absen Upload:", data);
    absenUpload(data);
  };

  // Convert data URL to File
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Get device location using Geolocation API
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung oleh browser ini."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const formatDateIndonesian = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return { day, date: formattedDate };
  };

  return (
    <div className="flex items-center justify-center -mt-28 sm:mt-0">
      <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md">
        <div className="mb-6 flex justify-around items-center">
          <div className="text-sm sm:text-lg font-bold">
            <p>{formatDateIndonesian(date).day},</p>
            <p>{formatDateIndonesian(date).date}</p>
          </div>
          <div className="flex items-center space-x-2">
            {Object.values(currentTime).map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-md sm:text-lg font-normal">{unit}</span>
                </div>
                {index < 2 && (
                  <span className="text-xl sm:text-lg font-bold mx-1">:</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-around">
          {/* Absen Masuk Button */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src="src/assets/ic_absen_masuk.svg"
              alt="Absen Masuk"
              width={120}
              height={64}
            />
            {is_absen_in ? (
              <button className="bg-green-500 text-white px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                ✅ Sudah Absen
              </button>
            ) : (
              <button
                onClick={() => handleAbsenClick(1)}
                disabled={isCheckPending}
                className="bg-primary text-white hover:bg-red-600 px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckPending ? "Loading..." : "Absen Masuk"}
              </button>
            )}
          </div>

          {/* Absen Keluar Button */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src="src/assets/ic_absen_keluar.svg"
              alt="Absen Keluar"
              width={120}
              height={64}
            />

            {is_absen_out ? (
              <button className="bg-green-500 text-white px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                ✅ Sudah Absen
              </button>
            ) : (
              <button
                onClick={() => handleAbsenClick(0)}
                disabled={isCheckPending}
                className="bg-muted text-textGray text-[11px] sm:text-sm font-semibold px-8 py-4 rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckPending ? "Loading..." : "Absen Pulang"}
              </button>
            )}
          </div>
        </div>

        {/* Location Selection Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <img
                src="src/assets/ic_lokasi_absen.svg"
                alt="Lokasi Absen"
                className="mx-auto mb-4"
              />
              <h2 className="text-lg font-bold mb-4 text-center">
                Konfirmasi Lokasi Absen
              </h2>
              <h3 className="text-center mb-4">
                Dimana kamu melakukan Absen Pulang?
              </h3>
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleLocationSelect(1)}
                  className="bg-[#B90101] text-white px-4 py-2 rounded-2xl w-full"
                >
                  Absen di Dalam Kantor
                </button>
                <button
                  onClick={() => handleLocationSelect(0)}
                  className="bg-[#550003] text-white px-4 py-2 rounded-2xl w-full"
                >
                  Absen di Luar Kantor
                </button>
              </div>
              {geolocationError && (
                <p className="text-red-500 mt-4">{geolocationError}</p>
              )}
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-center">
                {currentStep === "face" && "Ambil Foto Wajah"}
                {currentStep === "location" && "Ambil Foto Lokasi"}
                {currentStep === "letter" && "Ambil Foto Surat"}
              </h2>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full mb-4"
              />
              <button
                onClick={capturePhoto}
                className="bg-primary text-white px-4 py-2 rounded-2xl w-full mb-4"
              >
                Ambil Foto
              </button>
            </div>
          </div>
        )}

        {showKelainanModal && (
          <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-center">
                Pilih Kelainan
              </h2>
              <p className="text-center mb-4">
                Anda terlambat. Silakan pilih alasan kelainan.
              </p>
              <div className="flex flex-col space-y-2">
                {kelainanOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedKelainan(option.id);
                      setShowKelainanModal(false);
                      setShowModal(false);
                      setShowCameraModal(true);
                      setCurrentStep("face");
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-2xl w-full"
                  >
                    {option.name} {/* Ensure this matches the API response */}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Error Message */}
        {/* {isError && (
          <div className="mt-4 text-center text-red-500">
            Error: {error.message}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AbsenCard;
