import { Avatar } from "primereact/avatar";
import BoringAvatar from "boring-avatars";

function AvatarComponent({
  profilePicture,
  displayName,
  size,
  avatarClasses,
  boringAvatarClasses,
}) {
  return profilePicture ? (
    <Avatar
      image={profilePicture}
      className={`${avatarClasses} border border-gray-200 dark:border-gray-800/50`}
      shape="circle"
      style={{
        width: size,
        height: size,
        backgroundColor: "transparent",
        color: "#ffffff",
        fontSize: "1.25rem",
        fontWeight: "600",
      }}
      imagestyle={{
        objectFit: "cover",
        width: "100%",
        height: "100%",
      }}
    />
  ) : (
    <BoringAvatar
      size={size}
      name={displayName}
      variant="beam"
      colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
      className={`${boringAvatarClasses} border border-gray-200 dark:border-gray-800/50`}
    />
  );
}

export default AvatarComponent;
