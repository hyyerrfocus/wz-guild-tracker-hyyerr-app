import { useState } from "react";
import { Check, X } from "lucide-react";

export default function WorldZeroTracker() {
  const [guildName, setGuildName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [members, setMembers] = useState([
    { name: "", level: "", isOnline: false },
  ]);

  const addMember = () => {
    setMembers([...members, { name: "", level: "", isOnline: false }]);
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center text-blue-400">
        World // Zero Guild Tracker
      </h1>

      <div className="bg-gray-800 p-4 rounded-xl shadow-lg space-y-3">
        <input
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
          placeholder="Guild Name"
          value={guildName}
          onChange={(e) => setGuildName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
          placeholder="Owner / Guild Master"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
      </div>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Members</h2>

      {members.map((member, index) => (
        <div
          key={index}
          className="bg-gray-800 p-4 rounded-xl shadow-lg mt-3 grid grid-cols-12 gap-2 items-center"
        >
          <input
            className="col-span-4 p-2 rounded-lg bg-gray-700 border border-gray-600"
            placeholder="Player Name"
            value={member.name}
            onChange={(e) =>
              updateMember(index, "name", e.target.value)
            }
          />

          <input
            className="col-span-3 p-2 rounded-lg bg-gray-700 border border-gray-600"
            placeholder="Level"
            value={member.level}
            onChange={(e) =>
              updateMember(index, "level", e.target.value)
            }
          />

          <div className="col-span-3 flex items-center gap-2">
            <span className="text-sm">Online?</span>
            <button
              onClick={() =>
                updateMember(index, "isOnline", !member.isOnline)
              }
              className={`p-2 rounded-lg border ${
                member.isOnline
                  ? "bg-green-600 border-green-500"
                  : "bg-red-600 border-red-500"
              }`}
            >
              {member.isOnline ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            onClick={() => removeMember(index)}
            className="col-span-2 bg-red-700 hover:bg-red-600 p-2 rounded-lg"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={addMember}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl"
      >
        + Add Member
      </button>
    </div>
  );
}
