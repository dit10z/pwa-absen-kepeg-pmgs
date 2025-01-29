import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import { absenInfoQueryOptions } from "../../queries/absenInfoQuery";
import { useSuspenseQuery } from "@tanstack/react-query";

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

  const { data } = useSuspenseQuery(absenInfoQueryOptions());

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <div className="mt-2">
        <button
          onClick={async () => {
            auth.logout();
            router.invalidate();
            await navigate({ to: "/login" });
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
