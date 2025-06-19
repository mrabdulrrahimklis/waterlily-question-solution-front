import { Link, Outlet } from "react-router";
import { Flower } from "lucide-react";

export default function Layout() {
  return (
    <div>
      <div>
        <Link to="/" className="flex border-b">
          <div className="flex justify-between items-center py-5 pl-3 pr-3 ml-3">
            <Flower size={36} />
          </div>
          <div className="mt-6 text-2xl font-bold">Waterlily</div>
        </Link>
      </div>
      <div className="container mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
