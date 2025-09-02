import PostCard from "./PostCard";

const dummyPosts = [
  {
    id: 1,
    username: "john_doe",
    userAvatar: "https://i.pravatar.cc/50?img=3",
    image: "https://picsum.photos/500/400",
    caption: "Enjoying the weekend!",
    likes: 120,
    comments: [{ user: "alex", text: "Looks fun!" }]
  },
  {
    id: 2,
    username: "jane_smith",
    userAvatar: "https://i.pravatar.cc/50?img=5",
    image: "https://picsum.photos/500/401",
    caption: "Vacation mode 🌴",
    likes: 98,
    comments: [{ user: "mike", text: "Wow!" }]
  }
];

const Feed = () => {
  return (
    <div className="flex-1 p-4 bg-gray-100 min-h-screen">
      {dummyPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
