from jinja2 import Template
from .models import CVData

ATS_CV_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 20mm 18mm 18mm 18mm;
  }

  /* ── Base typography ─────────────────────────── */
  body {
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 9.5pt;
    color: #1a1a1a;
    background: white;
    line-height: 1.5;
  }

  /* ── Header: name block ──────────────────────── */
  .cv-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 24pt;
    font-weight: 700;
    color: #111111;
    letter-spacing: -0.3px;
    margin-bottom: 5px;
  }

  .cv-contact {
    font-size: 9.5pt;
    color: #444444;
    line-height: 1.7;
    margin-bottom: 4px;
    /* Prevent long URLs from wrapping mid-word */
    word-break: break-all;
    overflow-wrap: break-word;
  }

  /* Each contact item on its own row */
  .cv-contact-item {
    display: block;
    margin-bottom: 1px;
  }

  /* URLs stay on one line — truncate visually if extremely long */
  .cv-contact-url {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }

  .header-divider {
    border: none;
    border-top: 2px solid #009161;
    margin: 10px 0 0 0;
  }

  /* ── Section wrapper ─────────────────────────── */
  /*
     page-break-inside: avoid keeps the heading + first item together.
     The 18px bottom margin creates the "line space after section ends"
     the user requested.
  */
  .section {
    margin-top: 16px;
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  /* Section heading: ONLY element that uses brand colour + uppercase */
  .section-heading {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 14pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0px;
    color: #009161;
    border-bottom: 1px solid #d1d5db;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }

  /* ── Item (experience / education / project) ─── */
  .item {
    margin-bottom: 11px;
    page-break-inside: avoid;
  }
  .item:last-child { margin-bottom: 0; }

  /* Float trick: title left, date right — xhtml2pdf safe */
  .item-header { 
    display: table !important; 
    width: 100% !important; 
  }

  /* Job title / institution — dark, bold, NOT green */
  .item-title { 
    display: table-cell !important;
    text-align: left !important;
    font-size: 10.5pt; 
    font-weight: 700; 
    color: #111827; 
    vertical-align: middle;
    line-height: 0.1;
  }

  .item-date-cell {
    display: table-cell !important;
    text-align: right !important; /* Pushes the badge directly to the right edge */
    white-space: nowrap;
    vertical-align: middle;
  }

  .item-date {
    display: inline-block !important;
    font-size: 8.5pt; 
    color: #9ca3af; 
    white-space: nowrap;
    background: #f9fafb; 
    padding: 2px 7px; 
    border-radius: 10px;
    border: 1px solid #e5e7eb; 
  }

  /* Company / institution subtitle — medium grey, NOT green */
  .item-subtitle {
    clear: both;
    font-size: 9pt;
    color: #444444;
    font-weight: 600;
    margin-top: 0px !important;
    margin-bottom: 2px;
  }

  .item-detail {
    font-size: 9pt;
    color: #555555;
    margin-top: 1px;
  }

  .item-desc {
    font-size: 9pt;
    color: #333333;
    margin-top: 4px;
    line-height: 1.55;
  }

  .item-bullets {
    margin-top: 4px;
    padding-left: 16px;
    color: #333333;
  }

  .item-bullets li {
    font-size: 9pt;
    margin-bottom: 2px;
    line-height: 1.5;
  }

  /* Project */
  .project-link-row {
    font-size: 0.9em;
    margin-bottom: 6px;
  }
  .project-link {
    color: #666666;
    text-decoration: none;
    white-space: nowrap; /* Ensures the URL stays on a single continuous line */
  }
  .project-link:hover {
    text-decoration: underline;
  }  

  /* ── Skill categories ────────────────────────── */
  .skill-category {
    margin-bottom: 8px;
  }

  .skill-category-name {
    font-size: 9pt;
    font-weight: 700;
    color: #333333;        /* dark grey — NOT green */
    margin-bottom: 4px;
  }

  /* Skills flow inline — 3 per row via inline-block */
  .skill-item {
    display: inline-block;
    width: 30%;
    font-size: 9pt;
    color: #2a2a2a;
    margin-bottom: 3px;
    vertical-align: top;
    padding-right: 6px;
  }

  .skill-bullet {
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #555555;   /* neutral bullet — NOT green */
    margin-right: 5px;
    margin-bottom: 1px;
    vertical-align: middle;
  }

  .skill-level {
    font-size: 8pt;
    color: #888888;
    font-style: italic;
  }

  /* ── Languages ───────────────────────────────── */
  .lang-row {
    display: inline-block;
    margin-right: 22px;
    margin-bottom: 3px;
    font-size: 9pt;
  }

  .lang-name  { font-weight: 600; color: #1a1a1a; }
  .lang-level { color: #666666; }

  /* ── Generic list items (awards / certs / activities) ── */
  .list-item {
    margin-bottom: 7px;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
  }

  .list-item-title { font-weight: 600; color: #111111; }
  .list-item-meta  { color: #666666; font-size: 8.5pt; margin-top: 1px; }

  /* ── References ──────────────────────────────── */
  .ref-item {
    margin-bottom: 9px;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  .ref-name    { font-weight: 700; color: #111111; }
  .ref-role    { color: #444444; }
  .ref-contact { color: #444444; }   /* NOT green — plain for ATS */

  /* ── Technologies (projects) ─────────────────── */
  .tech-list {
    margin-top: 4px;
    font-size: 8.5pt;
    color: #555555;
  }

  .tech-list strong { color: #111111; }

  /* ── Summary ─────────────────────────────────── */
  .summary-text {
    font-size: 9.5pt;
    color: #333333;
    line-height: 1.6;
  }
</style>
</head>
<body>

<!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
<div class="cv-name">{{ cv.name or 'Your Name' }}</div>

<div class="cv-contact">
  {%- if cv.email %}
  <span class="cv-contact-item">{{ cv.email }}</span>
  {%- endif %}
  {%- if cv.phone %}
  <span class="cv-contact-item">{{ cv.phone }}</span>
  {%- endif %}
  {%- if cv.location %}
  <span class="cv-contact-item">{{ cv.location }}</span>
  {%- endif %}
  {%- if cv.linkedin %}
  <span class="cv-contact-item">
    <span class="cv-contact-url">LinkedIn: {{ cv.linkedin }}</span>
  </span>
  {%- endif %}
  {%- if cv.github %}
  <span class="cv-contact-item">
    <span class="cv-contact-url">GitHub: {{ cv.github }}</span>
  </span>
  {%- endif %}
  {%- if cv.website %}
  <span class="cv-contact-item">
    <span class="cv-contact-url">{{ cv.website }}</span>
  </span>
  {%- endif %}
</div>

<hr class="header-divider"/>

<!-- ══ SUMMARY ═════════════════════════════════════════════════════════ -->
{%- if cv.sections.summary and cv.summary %}
<div class="section">
  <div class="section-heading">Professional Summary</div>
  <p class="summary-text">{{ cv.summary }}</p>
</div>
{%- endif %}

<!-- ══ EXPERIENCE ══════════════════════════════════════════════════════ -->
{%- if cv.sections.experience and cv.experience %}
<div class="section">
  <div class="section-heading">Work Experience</div>

  {%- for exp in cv.experience %}
  <div class="item">
    <div class="item-header">
      <div class="item-title">{{ exp.job_title or 'Role' }}</div>
      <div class="item-date-cell">
        <span class="item-date">
        {%- if exp.start_date %}{{ exp.start_date }}{% endif %}
        {%- if exp.start_date or exp.end_date %} &ndash; {% endif %}
        {%- if exp.is_current %}Present{%- elif exp.end_date %}{{ exp.end_date }}{% endif %}</span>
      </div>
    </div>

    {%- if exp.company %}
    <div class="item-subtitle">{{ exp.company }}</div>
    {%- endif %}

    {%- if exp.description %}
      {%- set lines = exp.description.split('\n') %}
      {%- if lines | length > 1 %}
      <ul class="item-bullets">
        {%- for line in lines %}
        {%- if line.strip() %}
        <li>{{ line.strip().lstrip('-~\u2022\u25aa\u25e6') }}</li>
        {%- endif %}
        {%- endfor %}
      </ul>
      {%- else %}
      <div class="item-desc">{{ exp.description }}</div>
      {%- endif %}
    {%- endif %}
  </div>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ EDUCATION ═══════════════════════════════════════════════════════ -->
{%- if cv.sections.education and cv.education %}
<div class="section">
  <div class="section-heading">Education</div>

  {%- for edu in cv.education %}
  <div class="item">
    <div class="item-header">
      <div class="item-title">{{ edu.institution or '' }}</div>
      <div class="item-date">
        {%- if edu.start_date %}{{ edu.start_date }}{% endif %}
        {%- if edu.start_date or edu.end_date %} &ndash; {% endif %}
        {%- if edu.is_current %}Present{%- elif edu.end_date %}{{ edu.end_date }}{% endif %}
      </div>
    </div>
    <div class="item-subtitle">
      {{ edu.degree or '' }}{%- if edu.field %} &middot; {{ edu.field }}{% endif %}
      {%- if edu.minor %} &middot; Minor: {{ edu.minor }}{% endif %}
    </div>
    {%- if edu.cgpa %}
    <div class="item-detail">CGPA: {{ edu.cgpa }}</div>
    {%- endif %}
    {%- if edu.grades %}
    <div class="item-detail">Grades: {{ edu.grades }}</div>
    {%- endif %}
  </div>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ SKILLS ══════════════════════════════════════════════════════════ -->
{%- if cv.sections.skills and cv.skills %}
<div class="section">
  <div class="section-heading">Skills</div>

  {#
    Support two layouts:
    1. Categorised  — cv.skill_categories is a list of
       { category: str, skills: [CVSkill] }
    2. Flat (legacy) — cv.skills is a plain list of CVSkill
       Group them all under a single invisible category.
  #}

  {%- if cv.skill_categories %}
    {%- for cat in cv.skill_categories %}
    <div class="skill-category">
      {%- if cat.category %}
      <div class="skill-category-name">{{ cat.category }}</div>
      {%- endif %}
      {%- for skill in cat.skills %}
      <div class="skill-item">
        <span class="skill-bullet"></span>
        <span>{{ skill.name }}</span>
        {%- if skill.proficiency %}
        <span class="skill-level"> ({{ skill.proficiency }})</span>
        {%- endif %}
      </div>
      {%- endfor %}
    </div>
    {%- endfor %}

  {%- else %}
    {#  Flat list — group automatically by proficiency if present,
        otherwise just render in a 3-column inline-block grid           #}
    {%- set ns = namespace(last_prof=None) %}
    {%- for skill in cv.skills %}
    <div class="skill-item">
      <span class="skill-bullet"></span>
      <span>{{ skill.name }}</span>
      {%- if skill.proficiency %}
      <span class="skill-level"> ({{ skill.proficiency }})</span>
      {%- endif %}
    </div>
    {%- endfor %}
  {%- endif %}

</div>
{%- endif %}

<!-- ══ PROJECTS ════════════════════════════════════════════════════════ -->
{%- if cv.sections.projects and cv.projects %}
<div class="section">
  <div class="section-heading">Projects</div>
  {%- for proj in cv.projects %}
  <div class="item">
    <div class="item-header">
      <div class="item-title">{{ proj.title or 'Project' }}</div>
    </div>
    {%- if proj.technologies %}
    <div class="tech-list"><strong>Technologies:</strong> {{ proj.technologies }}</div>
    {%- endif %}
    {%- if proj.link %}
    <div class="project-link-row">
      <strong>Link:</strong> <a href="{{ proj.link }}" target="_blank" class="project-link">{{ proj.link }}</a>
    </div>
    {%- endif %}
    {%- if proj.description %}
      {%- set lines = proj.description.split('\n') %}
      {%- if lines | length > 1 %}
      <ul class="item-bullets">
        {%- for line in lines %}
        {%- if line.strip() %}
        <li>{{ line.strip().lstrip('-~•▪◦') }}</li>
        {%- endif %}
        {%- endfor %}
      </ul>
      {%- else %}
      <div class="item-desc">{{ proj.description }}</div>
      {%- endif %}
    {%- endif %}
  </div>
  {%- endfor %}
</div>
{%- endif %}

<!-- ══ LANGUAGES ═══════════════════════════════════════════════════════ -->
{%- if cv.sections.languages and cv.languages %}
<div class="section">
  <div class="section-heading">Languages</div>

  {%- for lang in cv.languages %}
  <span class="lang-row">
    <span class="lang-name">{{ lang.name }}</span>
    {%- if lang.proficiency %}
    <span class="lang-level"> &mdash; {{ lang.proficiency }}</span>
    {%- endif %}
    {%- if lang.raw_score %}
    <span class="lang-level"> ({{ lang.raw_score }})</span>
    {%- endif %}
  </span>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ AWARDS ══════════════════════════════════════════════════════════ -->
{%- if cv.sections.awards and cv.awards %}
<div class="section">
  <div class="section-heading">Awards &amp; Achievements</div>

  {%- for award in cv.awards %}
  <div class="list-item">
    <div class="list-item-title">{{ award.title }}</div>
    <div class="list-item-meta">
      {%- if award.issuer %}{{ award.issuer }}{% endif %}
      {%- if award.issuer and award.year %} &middot; {% endif %}
      {%- if award.year %}{{ award.year }}{% endif %}
      {%- if award.level %} &middot; {{ award.level }}{% endif %}
    </div>
  </div>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ ACTIVITIES ══════════════════════════════════════════════════════ -->
{%- if cv.sections.activities and cv.activities %}
<div class="section">
  <div class="section-heading">Leadership &amp; Activities</div>

  {%- for act in cv.activities %}
  <div class="list-item">
    <div class="list-item-title">
      {{ act.role or act.title }}
      {%- if act.organization %} &middot; {{ act.organization }}{% endif %}
    </div>
    <div class="list-item-meta">
      {%- if act.year %}{{ act.year }}{% endif %}
      {%- if act.duration %} ({{ act.duration }}){% endif %}
      {%- if act.description %} &mdash; {{ act.description }}{% endif %}
    </div>
  </div>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ CERTIFICATIONS ══════════════════════════════════════════════════ -->
{%- if cv.sections.certifications and cv.certifications %}
<div class="section">
  <div class="section-heading">Certifications</div>

  {%- for cert in cv.certifications %}
  <div class="list-item">
    <div class="list-item-title">{{ cert.name }}</div>
    <div class="list-item-meta">
      {%- if cert.issuer %}{{ cert.issuer }}{% endif %}
      {%- if cert.issuer and cert.year %} &middot; {% endif %}
      {%- if cert.year %}{{ cert.year }}{% endif %}
      {%- if cert.expiry %} &middot; Expires: {{ cert.expiry }}{% endif %}
      {%- if cert.credential_id %} &middot; ID: {{ cert.credential_id }}{% endif %}
    </div>
  </div>
  {%- endfor %}

</div>
{%- endif %}

<!-- ══ REFERENCES ══════════════════════════════════════════════════════ -->
{%- if cv.sections.references and cv.references %}
<div class="section">
  <div class="section-heading">References</div>

  {%- for ref in cv.references %}
  <div class="ref-item">
    <div class="ref-name">{{ ref.name }}</div>
    <div class="ref-role">
      {%- if ref.title %}{{ ref.title }}{% endif %}
      {%- if ref.title and ref.organization %} &middot; {% endif %}
      {%- if ref.organization %}{{ ref.organization }}{% endif %}
    </div>
    {%- if ref.email %}
    <div class="ref-contact">{{ ref.email }}</div>
    {%- endif %}
    {%- if ref.phone %}
    <div class="ref-contact">{{ ref.phone }}</div>
    {%- endif %}
  </div>
  {%- endfor %}

</div>
{%- endif %}

</body>
</html>"""


def render_cv_html(cv_data: CVData) -> str:
    """Render CVData into ATS-optimised HTML string for xhtml2pdf."""
    template = Template(ATS_CV_TEMPLATE)
    return template.render(cv=cv_data)