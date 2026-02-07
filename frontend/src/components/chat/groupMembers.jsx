import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { GroupMembersModal } from "../modals/groupMembersModal.jsx";

import { AvatarGroup } from "primereact/avatargroup";
import { Skeleton } from "primereact/skeleton";
import { Avatar } from "primereact/avatar";
import BoringAvatar from "boring-avatars";
import { MdKeyboardArrowRight } from "react-icons/md";

function GroupMembers({ chat }) {
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // reset when chat changes
    setGroupMembers([]);
    setLoading(true);

    const fetchMembers = () => {
      api
        .get(`/chat/members/${chat.id}`)
        .then((response) => {
          setGroupMembers(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (chat?.id) fetchMembers();
  }, [chat?.id]);

  const handleOpenMembers = () => {
    setShowAll(true);
  };

  return (
    <div>
      {loading ? (
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              height="32px"
              width="32px"
              shape="circle"
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center">
          <AvatarGroup
            className="flex items-center"
            style={{ alignItems: "center" }}
          >
            {groupMembers.slice(0, 5).map((member) =>
              member.avatar ? (
                <Avatar
                  key={member.id}
                  label={member.username[0]?.toUpperCase()}
                  image={member.avatar}
                  size="normal"
                  shape="circle"
                  className={`mr-2 shrink-0 overflow-hidden text-md bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-200 ${member.avatar ? "border border-gray-200 dark:border-gray-800" : ""}`}
                  imagestyle={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  style={{
                    width: "32px",
                    height: "32px",
                    aspectRatio: "1/1",
                  }}
                />
              ) : (
                <BoringAvatar
                  key={member.id}
                  size={32}
                  name={member.username}
                  variant="beam"
                  colors={[
                    "#0a0310",
                    "#49007e",
                    "#ff005b",
                    "#ff7d10",
                    "#ffb238",
                  ]}
                  className="p-avatar mr-2 p-avatar-circle shrink-0 h-[30px] w-[30px] overflow-hidden rounded-full border border-gray-200 dark:border-gray-800"
                />
              ),
            )}

            {groupMembers.length > 5 ? (
              <Avatar
                onClick={handleOpenMembers}
                label={`+${groupMembers.length - 5}`}
                size="normal"
                shape="circle"
                className="font-medium bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-200"
                style={{
                  width: "32px",
                  height: "32px",
                  aspectRatio: "1/1",
                  cursor: "pointer",
                  verticalAlign: "middle",
                }}
              />
            ) : (
              <div
                className="ml-[-10px] cursor-pointer"
                onClick={handleOpenMembers}
              >
                <MdKeyboardArrowRight size={20} />
              </div>
            )}
          </AvatarGroup>
        </div>
      )}
      {showAll && (
        <GroupMembersModal
          members={groupMembers}
          onClose={() => setShowAll(false)}
        />
      )}
    </div>
  );
}

export default GroupMembers;
