import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import { absenInfoQueryOptions } from "../../queries/absenInfoQuery";
import { useSuspenseQuery } from "@tanstack/react-query";
import BottomNavigation from "../../components/BottomNavigation";
import AbsenCard from "../../components/Absen";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(absenInfoQueryOptions());
  },
});

function RouteComponent() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { data } = useSuspenseQuery(absenInfoQueryOptions());

  return (
    <div className="font-poppins bg-gray-100 min-h-screen relative">
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 mb-6 h-48 sm:flex sm:flex-col sm:items-center sm:justify-center lg:h-64">
        <div className="flex items-center mb-4 ">
          <div className="w-12 h-12 bg-white text-red-500 rounded-full flex items-center justify-center mr-4">
            <img src="/src/assets/logo.svg" alt="Logo" />
          </div>
          <div>
            <p className="text-xs">Halo, Selamat Pagi!</p>
            <h2 className="text-lg font-semibold">{data.name}</h2>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center -mt-2">
          {/* Left Side: Icon with Text */}
          <div className="flex flex-row items-center">
            <img
              src="src/assets/ic_jabatan_dashboard.svg"
              alt="Icon"
              className="mr-2" // Add spacing between the icon and the text
            />
            <p className="text-[13px]">
              {data.position} {data.department}
            </p>
          </div>

          {/* Divider */}
          <span className="mx-2 text-lg font-thin">|</span>

          {/* Right Side: Text */}
          <div className="flex flex-row items-center">
            <img
              src="src/assets/ic_cabang_dashboard.svg"
              alt="Icon"
              className="mr-2" // Add spacing between the icon and the text
            />
            <p className="text-[13px]">{data.office}</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 sm:px-6 md:px-8 py-4">
        <AbsenCard
          date={new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          currentTime={currentTime}
          is_absen_in={data.is_absen_in}
          is_absen_out={data.is_absen_out}
        />
        <h2 className="flex sm:justify-center text-sm sm:text-xl font-bold mt-4">
          Riwayat Absen Saat ini:
        </h2>

        <div className="mt-4 bg-white shadow-md rounded-lg p-4 w-full max-w-md mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <h2 className="text-sm sm:text-md font-semibold text-gray-800">
              Status Absensi:
            </h2>
            <span className="text-white text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500">
              {data.absent_status}
            </span>
          </div>

          <div className="flex space-x-4 mt-6">
            {/* Left side: Jam Masuk */}
            <div className="flex flex-row items-center w-48">
              <img
                src={data.inphoto}
                alt="Foto Masuk"
                className="w-16 h-16 rounded-lg bg-muted object-cover"
              />
              <div className="ml-1 sm:ml-4 flex flex-col">
                <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
                  Jam Masuk:
                </h3>
                <p className="text-textGray">{data.inpresent}</p>
              </div>
            </div>

            {/* Right side: Jam Keluar */}
            <div className="flex flex-row items-center w-48">
              <img
                src={data.outphoto}
                alt="Foto Keluar"
                className="w-16 h-16 rounded-lg bg-muted object-cover"
              />
              <div className="ml-1 sm:ml-4 flex flex-col">
                <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
                  Jam Keluar:
                </h3>
                <p className="text-textGray">{data.outpresent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* <div className="mt-2">
        <button
          onClick={async () => {
            auth.logout();
            router.invalidate();
            await navigate({ to: "/login" });
          }}
        >
          Logout
        </button>
      </div> */}
      <BottomNavigation />
    </div>
  );
}
