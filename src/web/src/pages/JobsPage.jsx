import { useState, useEffect } from "react";
import { Briefcase, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchJobs, fetchAppliedJobIds, applyToJob } from "../services/api";
import { categories } from "../data/restaurants";
import "./Dashboard.css";
import "./JobsPage.css";

function JobsPage({ onAuthClick }) {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // id of the job whose application form is open
  const [openJobId, setOpenJobId] = useState(null);
  const [form, setForm] = useState({ message: "", cvUrl: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isCustomer = user?.role === "CUSTOMER";

  // load the job posts and the applications of the customer
  async function load() {
    try {
      setJobs(await fetchJobs());
      setAppliedIds(isCustomer ? await fetchAppliedJobIds() : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // update one field of the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // send the application
  async function handleApply(event, job) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      await applyToJob(job.id, {
        message: form.message.trim(),
        cvUrl: form.cvUrl.trim(),
      });
      setForm({ message: "", cvUrl: "" });
      setOpenJobId(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="jobs-page">
      <div className="dash-header">
        <span className="eyebrow">ÁLLÁSOK</span>
        <h1>Dolgozz velünk</h1>
        <p>Az éttermek aktuális álláshirdetései.</p>
      </div>

      {loading ? (
        <p className="panel-empty">Betöltés...</p>
      ) : error ? (
        <p className="panel-empty">{error}</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <span>💼</span>
          <h3>Most nincs aktív hirdetés</h3>
          <p>Nézz vissza később!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => {
            const applied = appliedIds.includes(job.id);
            const emoji =
              categories.find((c) => c.name === job.restaurant?.category)?.emoji || "🍽️";

            return (
              <article className="job-card" key={job.id}>
                <div className="job-top">
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {emoji} {job.restaurant?.name}
                    </p>
                  </div>
                  <span className="badge badge-role">
                    <Briefcase size={12} /> {job.type}
                  </span>
                </div>

                <p className="job-description">{job.description}</p>

                {applied ? (
                  <span className="badge badge-ok">Jelentkeztél</span>
                ) : openJobId === job.id ? (
                  <form
                    className="job-form"
                    onSubmit={(event) => handleApply(event, job)}
                  >
                    <label className="field">
                      <span>Rövid bemutatkozás</span>
                      <input
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Miért te vagy a megfelelő?"
                        maxLength={250}
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Önéletrajz linkje (nem kötelező)</span>
                      <input
                        name="cvUrl"
                        value={form.cvUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </label>
                    {formError && <p className="auth-error">{formError}</p>}
                    <button className="primary-button" type="submit" disabled={saving}>
                      <Send size={16} /> {saving ? "Küldés..." : "Jelentkezés küldése"}
                    </button>
                  </form>
                ) : !user ? (
                  <button className="primary-button" onClick={onAuthClick}>
                    Jelentkezéshez lépj be
                  </button>
                ) : isCustomer ? (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setOpenJobId(job.id);
                      setFormError("");
                    }}
                  >
                    Jelentkezem
                  </button>
                ) : (
                  <span className="badge badge-wait">
                    Jelentkezni vásárlói fiókkal lehet
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default JobsPage;