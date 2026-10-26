import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useData } from "../context/DataContext";

// positions the restaurant can advertise
const jobTypes = ["Szakács", "Konyhai kisegítő", "Kiszolgáló", "Futár"];

function JobsPanel({ restaurantId }) {
  const { jobs, addJob, removeJob } = useData();

  const [form, setForm] = useState({
    title: "",
    type: jobTypes[0],
    description: "",
  });

  // only the jobs of this restaurant
  const myJobs = jobs.filter((job) => job.restaurantId === restaurantId);

  // update one field of the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // publish the job
  function handleSubmit(event) {
    event.preventDefault();

    addJob(restaurantId, {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
    });

    setForm({ title: "", type: jobTypes[0], description: "" });
  }

  // delete a job after confirmation
  function handleRemove(job) {
    if (window.confirm(`Biztosan törlöd: ${job.title}?`)) {
      removeJob(job.id);
    }
  }

  return (
    <section className="panel">
      <h2>Álláshirdetések</h2>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Hirdetés címe</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Pl. Pizzaszakács"
            required
          />
        </label>

        <label className="field">
          <span>Pozíció</span>
          <select name="type" value={form.type} onChange={handleChange}>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field form-wide">
          <span>Leírás</span>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Munkaidő, bérezés, elvárások"
            required
          />
        </label>

        <button className="primary-button form-wide" type="submit">
          <Plus size={18} /> Hirdetés közzététele
        </button>
      </form>

      {/* published jobs with their applicants */}
      {myJobs.length > 0 && (
        <div className="row-list jobs-admin-list">
          {myJobs.map((job) => (
            <article className="row-item job-row" key={job.id}>
              <div className="row-main">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <div className="row-tags">
                  <span className="badge badge-role">{job.type}</span>
                  <span className="badge badge-macro">
                    {job.applications.length} jelentkező
                  </span>
                </div>

                {job.applications.length > 0 && (
                  <ul className="applicant-list">
                    {job.applications.map((application) => (
                      <li key={application.id}>
                        <strong>{application.name}</strong>
                        {application.message && <span>{application.message}</span>}
                        {application.cvUrl && (
                          <a
                            href={application.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Önéletrajz
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="row-actions">
                <button
                  className="icon-button danger"
                  onClick={() => handleRemove(job)}
                  aria-label="Törlés"
                  title="Törlés"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default JobsPanel;