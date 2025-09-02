import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/UI/button";
//import { Card } from "../components/UI/card";
//import { CardContent } from "../components/UI/CardContent";
import { MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import ImagePreviewModal from "../components/Model/ImagePreviewModal";

const UserProfile = () => {
  const { username, userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/profile/${username}/${userId}`
        );
        if (isMounted) {
          console.log("Profile API Response 👉", res.data);
          setUser(res.data.user);
          setProfile(res.data.profile);
          setIsOwnProfile(res.data.user._id === loggedInUser?._id);
          setIsFollowing(res.data.user.followers.includes(loggedInUser._id));
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/posts/user/${username}/${userId}`
        );
        if (isMounted) {
          setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
        }
        console.log("Posts from API:", res.data.posts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    if (username && userId) {
      fetchUser();
      fetchPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [username, userId, loggedInUser._id, location.key]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await axios.post(
        `http://localhost:5000/api/users/${endpoint}/${username}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Follow success", res.data.message);
      setIsFollowing(!isFollowing);
      setUser((prevUser) => {
        const updatedFollowers = isFollowing
          ? prevUser.followers.filter((id) => id !== loggedInUser._id)
          : [...prevUser.followers, loggedInUser._id];
        return { ...prevUser, followers: updatedFollowers };
      });
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  const getProfileImage = () => {
    if (user?.profilePic) return user.profilePic;
    if (user?.gender === "male")
      return "/Images/SocialMediaProfileImageDefaultMale.jpg";
    if (user?.gender === "female")
      return "/Images/SocialMediaProfileImageDefaultFemale.jpg";
    return "/Images/SocialMediaDefaultImage.jpg";
  };

  if (!user) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="flex-1 w-full p-4 space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row gap-13 items-center sm:items-start">
        <img
          src={getProfileImage()}
          alt="Profile"
          className="w-40 h-40 rounded-full object-cover shadow-md"
          onClick={() => setIsPreviewOpen(true)}
        />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h2 className="text-3xl font-bold">
            @{user?.username || "username"}
          </h2>
          <p className="text-gray-800">{user?.name || "Name not set"}</p>
          <p className="whitespace-pre-line text-gray-800">{user?.bio || "No bio available"}</p>

          {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={user.profilePic}
      />

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500 mt-2">
            <button
              className="hover:underline cursor-pointer"
              onClick={() =>
                navigate(`/profile/${username}/${userId}/followers`)
              }
            >
              <strong>{user.followers?.length || 0}</strong> Followers
            </button>
            <button
              className="hover:underline cursor-pointer"
              onClick={() =>
                navigate(`/profile/${username}/${userId}/following`)
              }
            >
              <strong>{user.following?.length || 0}</strong> Following
            </button>
            <span>
              <strong>{posts.length}</strong> Posts
            </span>
          </div>

          <div className="flex justify-center sm:justify-start gap-3 mt-3">
            {isOwnProfile ? (
              <Button
                onClick={() => navigate(`/edit-profile/${username}/${userId}`)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/messages/${user.username}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {user.socials && (
        <div className="flex gap-4 text-blue-600 justify-center sm:justify-start">
          {profile?.socialLinks?.twitter && (
            <a
              href={profile.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Twitter
            </a>
          )}
          {profile?.socialLinks?.instagram && (
            <a
              href={profile.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Instagram
            </a>
          )}
          {profile?.socialLinks?.linkedin && (
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        {posts.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No posts yet
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="aspect-square bg-black overflow-hidden"
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover hover:opacity-80 transition duration-200"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;
