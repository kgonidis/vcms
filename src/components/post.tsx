"use client";
import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import "react-datepicker/dist/react-datepicker.css";

// Options for repeat intervals
const repeatOptions = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Options for social platforms
const socialOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "bluesky", label: "Bluesky" },
];

// Interface for scheduling parameters
export interface ScheduleParameters {
  text: string; // Post text
  dateTime?: Date; // Date and time for scheduled posts
  repeat: string; // Repeat interval (e.g., "none", "daily")
  social: string[]; // Selected social platforms
  assets: File[]; // Uploaded media files
  immediate: boolean; // Whether the post is immediate or scheduled
}

// Props for the ScheduledPostModal component
interface ScheduledPostModalProps {
  isOpen: boolean; // Whether the modal is open
  onRequestClose: () => void; // Function to close the modal
  onSchedule: (data: ScheduleParameters) => void; // Function to handle scheduling
}

// ScheduledPostModal component for creating or scheduling posts
export default function ScheduledPostModal({ isOpen, onRequestClose, onSchedule }: ScheduledPostModalProps) {
  const [text, setText] = useState(""); // Post text
  const [date, setDate] = useState<Date | undefined>(new Date()); // Selected date
  const [repeat, setRepeat] = useState(repeatOptions[0]); // Selected repeat option
  const [social, setSocial] = useState<typeof socialOptions>([]); // Selected social platforms
  const [files, setFiles] = useState<File[]>([]); // Uploaded files
  const [immediate, setImmediate] = useState(false); // Whether the post is immediate

  // Dropzone configuration for file uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (accepted) => setFiles(accepted), // Handle dropped files
  });

  // Reset the form state
  const resetState = () => {
    setText("");
    setDate(new Date());
    setRepeat(repeatOptions[0]);
    setSocial([]);
    setFiles([]);
    setImmediate(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!text.trim()) {
      alert("Post text is required.");
      return;
    }

    if (!immediate && !date) {
      alert("Please choose a date/time or select Post Now.");
      return;
    }

    if (social.length === 0) {
      alert("Please select at least one social platform.");
      return;
    }

    // Call the onSchedule function with the collected data
    onSchedule({
      text,
      dateTime: immediate ? undefined : date!,
      repeat: immediate ? "none" : repeat.value,
      social: social.map((s) => s.value),
      assets: files,
      immediate,
    });

    resetState(); // Reset the form state
    onRequestClose(); // Close the modal
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Schedule Post"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-[#464db5]"
      ariaHideApp={false}
    >
      <h2 className="text-xl font-semibold mb-4">{immediate ? "Post Now" : "Schedule a Post"}</h2>

      {/* Timing selector */}
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-1 text-sm font-medium">
          <input
            type="radio"
            name="timing"
            checked={immediate}
            onChange={() => setImmediate(true)}
          />
          Post Now
        </label>
        <label className="flex items-center gap-1 text-sm font-medium">
          <input
            type="radio"
            name="timing"
            checked={!immediate}
            onChange={() => setImmediate(false)}
          />
          Schedule
        </label>
      </div>

      {/* Post text input */}
      <label className="block mb-1 font-medium text-sm">Post Text</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full border rounded p-2 mb-4"
        placeholder="What's on your mind?"
      />

      {!immediate && (
        <>
          {/* Date and time picker */}
          <label className="block mb-1 font-medium text-sm">Date & Time</label>
          <DatePicker
            selected={date}
            onChange={(d) => d && setDate(d)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="w-full border rounded p-2 mb-4"
            minDate={new Date()}
          />

          {/* Repeat interval selector */}
          <label className="block mb-1 font-medium text-sm">Repeat</label>
          <Select
            options={repeatOptions}
            value={repeat}
            onChange={(v) => v && setRepeat(v)}
            className="mb-4"
            classNamePrefix="react-select"
          />
        </>
      )}

      {/* Social platform selector */}
      <label className="block mb-1 font-medium text-sm">Social Platforms</label>
      <Select
        options={socialOptions}
        value={social}
        onChange={(v) => v && setSocial(v.map((s) => s))}
        className="mb-4"
        classNamePrefix="react-select"
        isMulti
        closeMenuOnSelect={false}
      />

      {/* File upload section */}
      <label className="block mb-1 font-medium text-sm">Media (Images / Videos)</label>
      <div
        {...getRootProps()}
        className="border-dashed border-2 rounded p-4 text-center mb-4 cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select</p>
      </div>

      {/* Display uploaded files */}
      {files.length > 0 && (
        <ul className="mb-4 list-disc list-inside text-sm">
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onRequestClose}
          className="px-4 py-2 rounded border border-gray-400 text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          {immediate ? "Post" : "Schedule"}
        </button>
      </div>
    </Modal>
  );
}