import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeName, setResumeName ] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()
    const hasProfileInput = Boolean(resumeName) || selfDescription.trim().length > 0
    const canGenerate = jobDescription.trim().length > 0 && hasProfileInput

    const handleGenerateReport = async () => {
        if (!canGenerate) return

        const resumeFile = resumeInputRef.current?.files?.[ 0 ]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        navigate(`/interview/${data._id}`)
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <div className='ambient ambient--one' />
            <div className='ambient ambient--two' />
            <div className='ambient ambient--three' />

            <section className='hero'>
                <p className='hero__eyebrow'>Interview Strategy Studio</p>
                <h1>Create a standout interview plan in minutes</h1>
                <p className='hero__subtitle'>
                    Blend your target role and your profile to get a focused preparation strategy, likely question areas,
                    and tailored talking points.
                </p>
                <div className='hero__stats'>
                    <article>
                        <h3>Role Context</h3>
                        <p>Extracts must-have skills and hiring signals from the JD.</p>
                    </article>
                    <article>
                        <h3>Profile Match</h3>
                        <p>Maps your experience to role demands and highlights strengths.</p>
                    </article>
                    <article>
                        <h3>Action Plan</h3>
                        <p>Builds a practical prep roadmap before your next interview.</p>
                    </article>
                </div>
            </section>

            <section className='studio-shell'>
                <div className='studio-grid'>
                    <article className='panel panel--left'>
                        <div className='panel__header'>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <p className='panel__caption'>Paste the complete role details so the AI can detect expectations and priorities.</p>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            value={jobDescription}
                            className='panel__textarea panel__textarea--large'
                            placeholder={`Paste the full job description here...\n\nTip: include responsibilities, required skills, and preferred qualifications.`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000</div>
                    </article>

                    <article className='panel panel--right'>
                        <div className='panel__header'>
                            <h2>Your Profile</h2>
                        </div>
                        <p className='panel__caption'>Upload a resume or write a quick summary so the strategy fits your background.</p>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <p className='dropzone__title'>Click to upload your resume</p>
                                <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                {resumeName && <p className='dropzone__file'>{resumeName}</p>}
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={(e) => {
                                        const file = e.target.files?.[ 0 ]
                                        setResumeName(file ? file.name : "")
                                    }}
                                />
                            </label>
                        </div>

                        <div className='or-divider'><span>Or add a quick summary</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                value={selfDescription}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                maxLength={2000}
                                placeholder='Summarize your experience, key technologies, and years of practice if you are not uploading a resume.'
                            />
                            <div className='char-counter'>{selfDescription.length} / 2000</div>
                        </div>

                        <div className='info-box'>
                            <p>A resume or self-description is required. The more specific your input, the sharper your plan.</p>
                        </div>
                    </article>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI Strategy Build | Approx 30 seconds</span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={!canGenerate}
                        className='generate-btn'>
                        Build My Interview Strategy
                    </button>
                </div>
            </section>

            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home