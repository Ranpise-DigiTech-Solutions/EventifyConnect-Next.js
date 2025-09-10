// src/components/UserProfileSkeleton.js

const UserProfileSkeleton = () => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-name-container">
          <div className="skeleton-name"></div>
          <div className="skeleton-subtitle"></div>
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;