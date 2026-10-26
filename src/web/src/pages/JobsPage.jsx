import { useState } from "react";
import { Briefcase, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import "./Dashboard.css";
import "./JobsPage.css";

function JobsPage({ onAuthClick }) {
  const { user } = useAuth();
  const { jobs, publicRestaurants, applyToJob } = useData();

  // id of the job whose application form is open
  const [openJobId, setOpenJobId] = useState(null);
  const [form, setForm] = useState({ message: "", cvUrl: "" });

  // only jobs of restaurants that are visible to customers
  const visibleJobs = jobs
    .map((job) => ({
      ...job,
      restaurant: publicRestaurants.find((r) => r.id === job.restaurantId),
    }))
    .filter((job) => job.restaurant);

  // update one field of the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // send the application
  function handleApply(event, job) {
    event.preventDefault();

    applyToJob(job.id, {
      userId: user.id,
      name: user.fullName,
      message: form.message.trim(),
      cvUrl: form.cvUrl.trim(),
    });

    setForm({ message: "", cvUrl: "" });
    setOpenJobId(null);
  }

  return (
    <main className="jobs-page">
      <div className="dash-header">
        <span className="eyebrow">ÁLLÁSOK</span>
        <h1>Dolgozz velünk</h1>
        <p>Az éttermek aktuális álláshirdetései.</p>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="empty-state">
          <span>💼</span>
          <h3>Most nincs aktív hirdetés</h3>
          <p>Nézz vissza később!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {visibleJobs.map((job) => {
            // did this user already apply
            const applied =
              user && job.applications.some((a) => a.userId === user.id);

            return (
              <article className="job-card" key={job.id}>
                <div className="job-top">
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.restaurant.emoji} {job.restaurant.name}
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
                    <button className="primary-button" type="submit">
                      <Send size={16} /> Jelentkezés küldése
                    </button>
                  </form>
                ) : (
                  <button
                    className="primary-button"
                    onClick={() => (user ? setOpenJobId(job.id) : onAuthClick())}
                  >
                    {user ? "Jelentkezem" : "Jelentkezéshez lépj be"}
                  </button>
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