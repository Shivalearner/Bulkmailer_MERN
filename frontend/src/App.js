import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setmsg] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handlemsg(e) {
    setmsg(e.target.value);
  }

  function handleSubject(e) {
    setSubject(e.target.value);
  }

  function handlefile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emails = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalEmails = emails.map((item) => item.A);
      setEmailList(totalEmails);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    if (!subject || !msg || emailList.length === 0) {
      alert("Please fill all fields and upload a valid Excel file.");
      return;
    }

    setstatus(true);
    axios
      .post("http://localhost:5000/sendemail", { msg, subject, emailList })
      .then((res) => {
        if (res.data === "Success") {
          alert("Email Sent Successfully ✅");
        } else {
          alert("Email Sending Failed ❌");
        }
        setstatus(false);
      })
      .catch((err) => {
        console.error("Request error:", err);
        alert("Something went wrong");
        setstatus(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 p-4">
      <div className="w-full max-w-3xl bg-white border border-blue-200 shadow-xl rounded-3xl p-8 space-y-6 text-gray-800">
        <h1 className="text-4xl font-bold text-center text-blue-600 tracking-wide flex items-center justify-center gap-2">
          ✉️ <span>BulkMailer</span>
        </h1>
        <p className="text-center text-gray-600 text-md leading-relaxed">
          🚀 Instantly send Multiple emails using an Excel sheet. Just upload 📄, type 📩 and hit send 💥.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-blue-700 font-semibold mb-1">📌 Subject</label>
            <input
              type="text"
              value={subject}
              onChange={handleSubject}
              className="w-full border border-blue-300 bg-blue-50 text-gray-800 px-4 py-2 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="block text-sm text-blue-700 font-semibold mb-1">📩 Message</label>
            <textarea
              value={msg}
              onChange={handlemsg}
              className="w-full h-28 border border-blue-300 bg-blue-50 text-gray-800 px-4 py-2 rounded-md shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type your message here..."
            />
          </div>

          <div>
            <label className="block text-sm text-blue-700 font-semibold mb-1">📤 Upload Excel File (.xlsx)</label>
            <input
              type="file"
              onChange={handlefile}
              className="w-full border-2 border-dashed border-blue-300 bg-white text-gray-700 p-3 rounded-md cursor-pointer hover:border-blue-400 transition"
              accept=".xlsx, .xls"
            />
          </div>

          <p className="text-blue-600 font-medium">
            📧 Emails detected: <span className="font-bold text-blue-800">{emailList.length}</span>
          </p>

          <button
            onClick={send}
            className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-cyan-500 py-3 rounded-lg font-bold text-white transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            {status ? "Sending..." : "Send Emails 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
