import Swal from "sweetalert2";
import axios from "axios";
import { useState } from "react";

export default function CreateNewUser() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); // Set loading to true when sign-up process starts
      const response = await axios.post("http://localhost:7073/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      if (response.status === 201) {
        Swal.fire({
          title: "Account Created",
          text: "User  has been created successfully!",
          icon: "success",
          confirmButtonText: "Continue",
        });
        
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "An error occurred",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false); // Set loading to false when sign-up process finishes
    }
  };

  return (
    <>
      <div className="login flex justify-center items-center ">
        <div className="login__content items-center justify-center rounded-lg mt-14 shadow-md p-8 w-[500px]">
          <p className="text-center text-blue-500 font-bold text-2xl mb-8">Create New User!</p>
      
          <form onSubmit={handleSignUp}>
            <div className="login__inputs flex  space-y-4 flex-col">
              <select
                className="mb-2 px-2 py-2 border border-black rounded-md"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="user">Student</option>
                <option value="creator">Creator</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="First Name"
                className="mb-2 px-2 py-2 border border-black rounded-md"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="mb-2 px-2 py-2 border border-black rounded-md"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Email"
                className="mb-2 px-2 py-2 border border-black rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="mb-4 px-2 py-2 border border-black rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-300 text-white font-bold py-2 rounded-md relative" // Add relative position
                disabled={loading} // Disable button when loading
              >
                {loading && <div className="loader absolute inset-0 bg-black opacity-50"></div>} {/* Loader effect */}
                {loading ? 'Loading...' : 'Create New User'} {/* Show loading text when loading */}
              </button>
            </div>
          </form>
         
        </div>
      </div>
    </>
  );
}
