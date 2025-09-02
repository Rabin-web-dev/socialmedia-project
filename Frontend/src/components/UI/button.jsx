export default function Button({ children, onClick }) {
    return (
      <button onClick={onClick} className="px-4 py-1 bg-blue-600 text-white rounded">
        {children}
      </button>
    );
  }
  