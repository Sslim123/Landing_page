import { useState } from "react";

export default function ApplyForm() {
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch(import.meta.env.VITE_FORM_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });

    setStatus(res.ok ? "success" : "error");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required placeholder="Full name" />
      <input name="email" type="email" required placeholder="Email" />
      <select name="course" required>
        <option value="">Select course</option>
        <option>Cybersecurity</option>
        <option>Network Architecture</option>
        <option>Digital Archiving</option>
      </select>

      {/* Honeypot */}
      <input type="text" name="_gotcha" style={{ display: "none" }} />

      <button type="submit">Apply</button>

      {status === "success" && <p>Application sent.</p>}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}
