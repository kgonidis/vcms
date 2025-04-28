"use client";
import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import "react-datepicker/dist/react-datepicker.css";

// Modal.setAppElement('#root'); // Call once in your app entry

const repeatOptions = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const socialOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "bluesky", label: "Bluesky" },
];

export interface ScheduleParameters {
  text: string;
  dateTime?: Date;       // undefined ⇒ post immediately
  repeat: string;        // "none" when immediate or non‑recurring
  social: string[];      // multiple platforms
  assets: File[];
  immediate: boolean;
}

interface ScheduledPostModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSchedule: (data: ScheduleParameters) => void;
}

export default function ScheduledPostModal({ isOpen, onRequestClose, onSchedule }: ScheduledPostModalProps) {
  const [text, setText] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [repeat, setRepeat] = useState(repeatOptions[0]);
  const [social, setSocial] = useState<typeof socialOptions>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [immediate, setImmediate] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (accepted) => setFiles(accepted),
  });

  const resetState = () => {
    setText("");
    setDate(new Date());
    setRepeat(repeatOptions[0]);
    setSocial([]);
    setFiles([]);
    setImmediate(false);
  };

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

    onSchedule({
      text,
      dateTime: immediate ? undefined : date!,
      repeat: immediate ? "none" : repeat.value,
      social: social.map((s) => s.value),
      assets: files,
      immediate,
    });

    resetState();
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Schedule Post"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-black"
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

      <label className="block mb-1 font-medium text-sm">Media (Images / Videos)</label>
      <div
        {...getRootProps()}
        className="border-dashed border-2 rounded p-4 text-center mb-4 cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select</p>
      </div>

      {files.length > 0 && (
        <ul className="mb-4 list-disc list-inside text-sm">
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}

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

// Utility: File → Uint8Array