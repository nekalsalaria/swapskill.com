import React, { useEffect, useState } from "react";
import {
  FaExchangeAlt,
  FaSearch,
  FaLinkedin,
  FaTimes,
  FaPaperPlane,
  FaComments,
  FaRegStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import profileImg from "../assets/profile.jpg";
import { useSelector } from "react-redux";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user.userData);
  const token = useSelector((state) => state.user.token);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/all")
      .then((res) => {
        const allUsers = res.data;
        const sorted = allUsers.sort((a, b) => {
          if (a._id === loggedInUser._id) return -1;
          if (b._id === loggedInUser._id) return 1;
          return 0;
        });
        setUsers(sorted);
        setFilteredUsers(sorted);
      })
      .catch((err) => console.error("Failed to fetch users", err))
      .finally(() => setLoading(false));
  }, [loggedInUser]);

  useEffect(() => {
    if (isChatOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/discussion");
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/discussion", {
        user: loggedInUser.name,
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.canTeach && user.canTeach.toLowerCase().includes(term)) ||
        (user.wantToLearn && user.wantToLearn.toLowerCase().includes(term))
    );
    setFilteredUsers(filtered);
  };

  const sendRequest = async (toUserId, skill, type) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/request",
        { toUserId, skill, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Request sent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      const updateFn = (prev) =>
        prev.map((u) =>
          u._id === toUserId
            ? {
                ...u,
                requests: [
                  ...(u.requests || []),
                  { from: loggedInUser._id, skill, type },
                ],
              }
            : u
        );
      setUsers(updateFn);
      setFilteredUsers(updateFn);
    } catch (err) {
      console.error("Request failed", err);
      const msg = err?.response?.data?.error || "❌ Failed to send request.";
      toast.error(msg, { position: "top-right", autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-200 via-pink-100 to-yellow-100 font-sans">
      <ToastContainer />

      {/* Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl sm:text-2xl">
          <FaExchangeAlt className="text-pink-500 text-2xl" />
          <span>
            Swap<span className="text-pink-500">Skill</span>
          </span>
        </div>

        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full w-1/2 max-w-md">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search skills or users..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <img
          src={profileImg}
          alt="Profile"
          onClick={() => navigate("/edit-profile")}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-pink-500 hover:border-blue-600 transition"
        />
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <section className="px-4 sm:px-6 py-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Connect with Learners & Mentors
          </h2>

          {loading ? (
            <p className="text-center text-gray-600">Loading users...</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-600 text-lg col-span-full">
                  ❌ No matching users found.
                </p>
              ) : (
                filteredUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 border border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-14 h-14 rounded-full border-2 border-pink-500 object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong>Knows:</strong> {user.canTeach || "Not specified"}
                    </p>
                    <p className="text-sm">
                      <strong>Wants to Learn:</strong>{" "}
                      {user.wantToLearn || "Not specified"}
                    </p>

                    {/* Rating UI */}
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(5)].map((_, index) => (
                        <FaRegStar key={index} className="text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        (0 reviews)
                      </span>
                    </div>

                    {user._id !== loggedInUser._id && (
                      <>
                        <div className="mt-4 flex justify-between gap-3">
                          {/* Request to Learn Button */}
                          {user.requests?.some(
                            (r) =>
                              r.from === loggedInUser._id && r.type === "learn"
                          ) ? (
                            <button className="bg-gray-400 text-white w-1/2 py-2 rounded-lg text-sm shadow-md cursor-not-allowed">
                              Pending...
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                sendRequest(
                                  user._id,
                                  user.canTeach || "Skill",
                                  "learn"
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white w-1/2 py-2 rounded-lg text-sm shadow-md transition"
                            >
                              Request to Learn
                            </button>
                          )}

                          {/* Offer to Teach Button */}
                          {user.requests?.some(
                            (r) =>
                              r.from === loggedInUser._id && r.type === "teach"
                          ) ? (
                            <button className="bg-gray-400 text-white w-1/2 py-2 rounded-lg text-sm shadow-md cursor-not-allowed">
                              Pending...
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                sendRequest(
                                  user._id,
                                  user.wantToLearn || "Skill",
                                  "teach"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700 text-white w-1/2 py-2 rounded-lg text-sm shadow-md transition"
                            >
                              Offer to Teach
                            </button>
                          )}
                        </div>

                        {/* Rate Mentor Button - now below and smaller */}
                        <button
                          onClick={() => setShowPopup(true)}
                          className="mt-3 w-2/3 mx-auto block bg-purple-500 hover:bg-purple-600 text-white py-1.5 rounded-md shadow text-sm transition"
                        >
                          Rate Mentor
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* Rating Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Action Required</h3>
            <p className="text-gray-600 mb-6">
              First you have to learn something from this mentor. Click on{" "}
              <strong>Request to Learn</strong> to proceed.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg transition"
      >
        <FaComments size={20} />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-96 h-[500px] shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Community Chat</h3>
              <FaTimes
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setIsChatOpen(false)}
              />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    msg.user === loggedInUser.name
                      ? "bg-pink-100 text-right"
                      : "bg-gray-100 text-left"
                  }`}
                >
                  <p className="text-sm font-bold">{msg.user}</p>
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={sendMessage}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-6 px-6 text-sm sm:text-base mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0 flex items-center gap-2 text-center sm:text-left">
            <FaLinkedin className="text-blue-400 text-lg" />
            <span>
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/nekalsingh/"
                className="text-blue-400 hover:text-blue-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nekal Singh
              </a>
            </span>
          </div>
          <div className="text-center sm:text-right">
            <p>Any Suggestions?</p>
            <a
              href="mailto:nekalsingh987@gmail.com"
              className="text-red-400 hover:text-red-300 transition"
            >
              nekalsingh987@gmail.com
            </a>
            <p className="mt-1 text-gray-400 text-xs">
              © {new Date().getFullYear()} SwapSkill. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
