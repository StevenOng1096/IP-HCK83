import { useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../lib/http";

export default function HomePublic() {
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data } = await axios.get("/movies");
      console.log(data.data.movies); // [object Object]
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  };
  return (
    <>
      <div></div>
    </>
  );
}
