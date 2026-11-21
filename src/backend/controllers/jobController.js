import { supabase } from '../supabaseClient.js';

// find the restaurant of the logged in restaurant admin
async function findMine(userId) {
  const { data } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  return data;
}

// public: all job posts of visible restaurants
export const getJobs = async (req, res) => {
  const { data, error } = await supabase
    .from('job_posts')
    .select('id, title, position_type, description, created_at, restaurants!inner(id, name, category, is_approved)')
    .eq('restaurants.is_approved', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// customer: ids of the jobs already applied to
export const getAppliedJobIds = async (req, res) => {
  const { data, error } = await supabase
    .from('job_application')
    .select('job_id')
    .eq('applicant_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map((row) => row.job_id));
};

// restaurant admin: own job posts with the applicants
export const getMyJobs = async (req, res) => {
  const mine = await findMine(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

  const { data, error } = await supabase
    .from('job_posts')
    .select('id, title, position_type, description, created_at, job_application(id, message, cv_url, created_at, profiles(full_name))')
    .eq('restaurant_id', mine.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// restaurant admin: publish a job post
export const createJob = async (req, res) => {
  const mine = await findMine(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

  const { title, type, description } = req.body;
  if (!title || !type || !description) {
    return res.status(400).json({ error: 'Hiányzó adatok.' });
  }

  const { data, error } = await supabase
    .from('job_posts')
    .insert({
      restaurant_id: mine.id,
      title: String(title).slice(0, 100),
      position_type: String(type).slice(0, 100),
      description,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// restaurant admin: delete an own job post
export const deleteJob = async (req, res) => {
  const mine = await findMine(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

  const { error } = await supabase
    .from('job_posts')
    .delete()
    .eq('id', req.params.id)
    .eq('restaurant_id', mine.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Törölve.' });
};

// customer: apply to a job post, once per job
export const applyToJob = async (req, res) => {
  const { message, cvUrl } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Írj egy rövid bemutatkozást.' });
  }
  if (cvUrl && !/^https?:\/\//i.test(cvUrl)) {
    return res.status(400).json({ error: 'Az önéletrajz linkje http(s)-sel kezdődjön.' });
  }

  const { data: job } = await supabase
    .from('job_posts')
    .select('id, restaurant_id, position_type')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!job) return res.status(404).json({ error: 'Nincs ilyen hirdetés.' });

  const { data: existing } = await supabase
    .from('job_application')
    .select('id')
    .eq('job_id', job.id)
    .eq('applicant_id', req.user.id)
    .maybeSingle();

  if (existing) return res.status(400).json({ error: 'Erre a hirdetésre már jelentkeztél.' });

  const { data, error } = await supabase
    .from('job_application')
    .insert({
      job_id: job.id,
      restaurant_id: job.restaurant_id,
      applicant_id: req.user.id,
      position_type: job.position_type,
      message: String(message).trim().slice(0, 250),
      cv_url: cvUrl || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};