import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUserData } from "../redux/userSlice";
import axios from "axios";
import profileImg from "../assets/profile.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const token = useSelector((state) => state.user.token);

  const [name, setName] = useState("");
  const [canTeach, setCanTeach] = useState("");
  const [wantToLearn, setWantToLearn] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCanTeach(user.canTeach || "");
      setWantToLearn(user.wantToLearn || "");
    }

    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/myrequests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(res.data.requests || []);
        setAcceptedRequests(res.data.acceptedRequests || []);
      } catch (err) {
        console.error("Failed to fetch requests", err);
        toast.error("Failed to fetch requests");
      }
    };

    fetchRequests();
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/update",
        { name, canTeach, wantToLearn },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setUserData(res.data.user));
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Profile update failed");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  const handleAccept = async (id) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/user/accept",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const accepted = pendingRequests.find((r) => r._id === id);
      setPendingRequests((prev) => prev.filter((r) => r._id !== id));
      setAcceptedRequests((prev) => [...prev, accepted]);
      toast.success("Request Accepted");
    } catch (err) {
      console.error("Accept failed", err);
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/decline",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests((prev) => prev.filter((r) => r._id !== id));
      toast.error("Request Declined");
    } catch (err) {
      console.error("Decline failed", err);
      toast.error("Failed to decline request");
    }
  };

  const handleDeleteAcceptedRequest = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/delete-accepted",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAcceptedRequests((prev) => prev.filter((r) => r._id !== id));
      toast.error("Accepted Request Deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete accepted request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-pink-200 py-10 px-4">
      <ToastContainer />
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center px-2 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm sm:text-base bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <img
              src={profileImg}
              alt="profile"
              className="w-24 h-24 rounded-full border-4 border-pink-500"
            />
            <h2 className="text-xl font-bold text-gray-800 mt-3">
              Edit Your Profile
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <textarea
              value={canTeach}
              onChange={(e) => setCanTeach(e.target.value)}
              placeholder="Skills you can teach (e.g. Java, Python)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <textarea
              value={wantToLearn}
              onChange={(e) => setWantToLearn(e.target.value)}
              placeholder="Skills you want to learn (e.g. DSA, React)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Requests */}
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <h2 className="text-xl font-bold text-yellow-700 sticky top-0 bg-white py-2 z-10">
                Pending Requests
              </h2>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 mt-2">No pending requests.</p>
              ) : (
                <ul className="space-y-4 mt-2">
                  {pendingRequests.map((req) => (
                    <li
                      key={req._id}
                      className="border border-gray-300 rounded-lg p-4 shadow-sm bg-yellow-50"
                    >
                      <p className="text-gray-700 font-medium mb-2">
                        <span className="font-bold">{req.from?.name}</span>{" "}
                        {req.type === "learn" ? (
                          <>wants to learn <span className="font-semibold">{req.skill}</span> from you.</>
                        ) : (
                          <>wants to teach you <span className="font-semibold">{req.skill}</span>.</>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{req.from?.email}</p>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Accepted Requests */}
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <h2 className="text-xl font-bold text-green-700 sticky top-0 bg-white py-2 z-10">
                Accepted Requests
              </h2>
              {acceptedRequests.length === 0 ? (
                <p className="text-gray-500 mt-2">No accepted requests.</p>
              ) : (
                <ul className="space-y-4 mt-2">
                  {acceptedRequests.map((req) => (
                    <li
                      key={req._id}
                      className="border border-green-300 rounded-lg p-4 shadow-sm bg-green-50"
                    >
                      <p className="text-gray-700 font-medium">
                        <span className="font-bold">{req.from?.name}</span>{" "}
                        {req.type === "learn" ? "will learn" : "will teach"}{" "}
                        <span className="font-semibold">{req.skill}</span>.
                      </p>
                      <p className="text-sm text-gray-500">{req.from?.email}</p>
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => navigate("/chat", {
                            state: {
                              toUserId: req.from._id,
                              toUserName: req.from.name,
                              toUserEmail: req.from.email,
                            },
                          })}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => handleDeleteAcceptedRequest(req._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
