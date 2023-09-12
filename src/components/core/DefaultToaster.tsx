import { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function DefaultToaster() {
  return (
    <Toaster
      position="bottom-center"
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        duration: 4000,
        // className: "w-full",
        // className: "bg-blue-500 text-white",
        icon: <FontAwesomeIcon icon={faInfoCircle} className="" />,

        // Default options for specific types
        success: {
          // className: "bg-slate-100 text-black",
          icon: (
            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
          ),
        },
        error: {
          className: "!bg-red-500 !text-white",
          icon: <FontAwesomeIcon icon={faCircleExclamation} className="" />,
        },
        loading: {
          className: "bg-blue-500 text-white",
        },
      }}
    />
  );
}
