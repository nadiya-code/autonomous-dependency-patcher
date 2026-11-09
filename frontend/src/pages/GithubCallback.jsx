import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GithubCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state"); const installationId = params.get("installation_id");
    if (!code || !state) {
      setError("Missing code from GitHub");
      return;
    }

    fetch("http://localhost:5000/api/github/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ code, state, installation_id: installationId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        navigate("/repositories", { replace: true });
      })
      .catch((err) => setError(err.message));
  }, [params, navigate]);

  return (
    <div className="text-slate-300">
      {error ? (
        <p className="text-red-400">Connection failed: {error}</p>
      ) : (
        <p>Connecting GitHub...</p>
      )}
    </div>
  );
}

