import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'
import jsPDF from 'jspdf'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ generatingQuestions, setGeneratingQuestions ] = useState(false)
    const [ technicalPage, setTechnicalPage ] = useState(1)
    const [ behavioralPage, setBehavioralPage ] = useState(1)
    const [ roadmapPage, setRoadmapPage ] = useState(1)
    const { report, getReportById, loading, getResumePdf, generateMoreQuestionsForReport } = useInterview()
    const { interviewId } = useParams()
    
    const QUESTIONS_PER_PAGE = 5
    const DAYS_PER_PAGE = 3

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    // Reset pagination when switching tabs
    useEffect(() => {
        setTechnicalPage(1)
        setBehavioralPage(1)
        setRoadmapPage(1)
    }, [ activeNav ])



    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='loading-spinner'>
                    <div className='spinner-ring'></div>
                    <div className='spinner-ring'></div>
                    <div className='spinner-ring'></div>
                </div>
                <h1>Loading your interview plan...</h1>
                <p className='loading-subtext'>Preparing your personalized report</p>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    const activeSection = NAV_ITEMS.find(item => item.id === activeNav)
    const activeCount =
        activeNav === 'technical' ? report.technicalQuestions.length :
            activeNav === 'behavioral' ? report.behavioralQuestions.length :
                report.preparationPlan.length

    const handleGenerateMoreQuestions = async (questionType) => {
        setGeneratingQuestions(true)
        try {
            await generateMoreQuestionsForReport(interviewId, questionType)
            // Wait a bit for the state to update,
            //  then move to next page
            setTimeout(() => {
                if (questionType === 'technical') {
                    setTechnicalPage(prev => prev + 1)
                } else {
                    setBehavioralPage(prev => prev + 1)
                }
            }, 300)
        } catch (error) {
            console.error('Failed to generate more questions:', error)
        } finally {
            setGeneratingQuestions(false)
        }
    }

    const handleNextPage = (questionType) => {
        if (questionType === 'technical') {
            setTechnicalPage(prev => prev + 1)
        } else {
            setBehavioralPage(prev => prev + 1)
        }
    }

    const handlePrevPage = (questionType) => {
        if (questionType === 'technical') {
            setTechnicalPage(prev => Math.max(1, prev - 1))
        } else {
            setBehavioralPage(prev => Math.max(1, prev - 1))
        }
    }

    // Calculate paginated questions
    const getPaginatedQuestions = (questions, currentPage) => {
        const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE
        const endIndex = startIndex + QUESTIONS_PER_PAGE
        return questions.slice(startIndex, endIndex)
    }

    const getTotalPages = (questions) => {
        return Math.ceil(questions.length / QUESTIONS_PER_PAGE)
    }

    const getPaginatedDays = (days, currentPage) => {
        const startIndex = (currentPage - 1) * DAYS_PER_PAGE
        const endIndex = startIndex + DAYS_PER_PAGE
        return days.slice(startIndex, endIndex)
    }

    const getTotalDaysPages = (days) => {
        return Math.ceil(days.length / DAYS_PER_PAGE)
    }

    const handleNextRoadmapPage = () => {
        setRoadmapPage(prev => prev + 1)
    }

    const handlePrevRoadmapPage = () => {
        setRoadmapPage(prev => Math.max(1, prev - 1))
    }

    const handleDownloadQuestions = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 15
        const maxWidth = pageWidth - 2 * margin
        let yPosition = 20

        // Helper to add new page if needed
        const checkPageBreak = (requiredSpace) => {
            if (yPosition + requiredSpace > pageHeight - margin) {
                doc.addPage()
                yPosition = 20
                return true
            }
            return false
        }

        // Helper to add wrapped text
        const addWrappedText = (text, fontSize = 10, fontStyle = 'normal') => {
            doc.setFontSize(fontSize)
            doc.setFont('helvetica', fontStyle)
            const lines = doc.splitTextToSize(text, maxWidth)
            
            lines.forEach((line) => {
                checkPageBreak(8)
                doc.text(line, margin, yPosition)
                yPosition += 5
            })
        }

        // Title
        doc.setFillColor(225, 29, 72)
        doc.rect(0, 0, pageWidth, 35, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.text('INTERVIEW QUESTIONS REPORT', pageWidth / 2, 15, { align: 'center' })
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(report.title || 'Untitled Position', pageWidth / 2, 25, { align: 'center' })

        // Reset text color and position
        doc.setTextColor(0, 0, 0)
        yPosition = 45

        // Header info
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
        doc.text(`Match Score: ${report.matchScore}%`, pageWidth - margin, yPosition, { align: 'right' })
        yPosition += 15

        // Technical Questions Section
        checkPageBreak(20)
        doc.setFillColor(225, 29, 72)
        doc.rect(margin, yPosition - 6, maxWidth, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`TECHNICAL QUESTIONS (${report.technicalQuestions.length})`, margin + 2, yPosition)
        doc.setTextColor(0, 0, 0)
        yPosition += 12

        report.technicalQuestions.forEach((q, index) => {
            checkPageBreak(35)
            
            // Question number and text
            doc.setFillColor(240, 240, 245)
            const questionTextHeight = Math.ceil(doc.splitTextToSize(q.question, maxWidth - 30).length * 5)
            doc.rect(margin, yPosition - 4, maxWidth, questionTextHeight + 4, 'F')
            
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text(`Q${index + 1}.`, margin + 2, yPosition)
            
            doc.text(doc.splitTextToSize(q.question, maxWidth - 30), margin + 15, yPosition)
            yPosition += questionTextHeight + 4

            // Intention
            yPosition += 4
            checkPageBreak(20)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(100, 100, 100)
            doc.text('INTENTION:', margin, yPosition)
            doc.setTextColor(0, 0, 0)
            yPosition += 5
            
            addWrappedText(q.intention, 9, 'normal')
            yPosition += 2

            // Model Answer
            yPosition += 4
            checkPageBreak(20)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(100, 100, 100)
            doc.text('MODEL ANSWER:', margin, yPosition)
            doc.setTextColor(0, 0, 0)
            yPosition += 5
            
            addWrappedText(q.answer, 9, 'normal')
            yPosition += 8
        })

        // Behavioral Questions Section
        checkPageBreak(20)
        doc.setFillColor(225, 29, 72)
        doc.rect(margin, yPosition - 6, maxWidth, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`BEHAVIORAL QUESTIONS (${report.behavioralQuestions.length})`, margin + 2, yPosition)
        doc.setTextColor(0, 0, 0)
        yPosition += 12

        report.behavioralQuestions.forEach((q, index) => {
            checkPageBreak(35)
            
            // Question number and text
            doc.setFillColor(240, 240, 245)
            const questionTextHeight = Math.ceil(doc.splitTextToSize(q.question, maxWidth - 30).length * 5)
            doc.rect(margin, yPosition - 4, maxWidth, questionTextHeight + 4, 'F')
            
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text(`Q${index + 1}.`, margin + 2, yPosition)
            
            doc.text(doc.splitTextToSize(q.question, maxWidth - 30), margin + 15, yPosition)
            yPosition += questionTextHeight + 4

            // Intention
            yPosition += 4
            checkPageBreak(20)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(100, 100, 100)
            doc.text('INTENTION:', margin, yPosition)
            doc.setTextColor(0, 0, 0)
            yPosition += 5
            
            addWrappedText(q.intention, 9, 'normal')
            yPosition += 2

            // Model Answer
            yPosition += 4
            checkPageBreak(20)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(100, 100, 100)
            doc.text('MODEL ANSWER:', margin, yPosition)
            doc.setTextColor(0, 0, 0)
            yPosition += 5
            
            addWrappedText(q.answer, 9, 'normal')
            yPosition += 8
        })

        // Save the PDF
        doc.save(`interview-questions-${report.title?.replace(/\s+/g, '-').toLowerCase() || 'report'}.pdf`)
    }

    return (
        <div className='interview-page'>
            <div className='interview-page__glow interview-page__glow--one' />
            <div className='interview-page__glow interview-page__glow--two' />

            <header className='interview-hero'>
                <span className='interview-hero__eyebrow'>Interview Intelligence Report</span>
                <h1>{report.title || 'Untitled Position'}</h1>
                <p>Review curated questions, track your match score, and execute a focused preparation roadmap.</p>
            </header>

            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Explore Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { getResumePdf(interviewId) }}
                        className='download-btn' >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                        Download Resume
                    </button>
                    <button
                        onClick={handleDownloadQuestions}
                        className='download-btn download-btn--secondary' >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download All Questions
                    </button>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {generatingQuestions && (
                        <div className='loading-overlay'>
                            <div className='loading-spinner'>
                                <div className='spinner-ring'></div>
                                <div className='spinner-ring'></div>
                                <div className='spinner-ring'></div>
                            </div>
                            <p className='loading-text'>Generating questions with AI...</p>
                            <p className='loading-subtext'>This may take a few moments</p>
                        </div>
                    )}
                    
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {getPaginatedQuestions(report.technicalQuestions, technicalPage).map((q, i) => (
                                    <QuestionCard 
                                        key={i} 
                                        item={q} 
                                        index={(technicalPage - 1) * QUESTIONS_PER_PAGE + i} 
                                    />
                                ))}
                            </div>
                            
                            <div className='pagination-controls'>
                                <div className='pagination-nav'>
                                    {technicalPage > 1 && (
                                        <button 
                                            onClick={() => handlePrevPage('technical')}
                                            className='pagination-btn'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                            Previous
                                        </button>
                                    )}
                                    
                                    <span className='pagination-info'>
                                        Page {technicalPage} of {getTotalPages(report.technicalQuestions)}
                                    </span>
                                    
                                    {technicalPage < getTotalPages(report.technicalQuestions) && (
                                        <button 
                                            onClick={() => handleNextPage('technical')}
                                            className='pagination-btn'
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    )}
                                </div>
                                
                                {technicalPage === getTotalPages(report.technicalQuestions) && (
                                    <button 
                                        onClick={() => handleGenerateMoreQuestions('technical')}
                                        disabled={generatingQuestions}
                                        className='generate-more-btn'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        Generate 5 More Questions
                                    </button>
                                )}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {getPaginatedQuestions(report.behavioralQuestions, behavioralPage).map((q, i) => (
                                    <QuestionCard 
                                        key={i} 
                                        item={q} 
                                        index={(behavioralPage - 1) * QUESTIONS_PER_PAGE + i} 
                                    />
                                ))}
                            </div>
                            
                            <div className='pagination-controls'>
                                <div className='pagination-nav'>
                                    {behavioralPage > 1 && (
                                        <button 
                                            onClick={() => handlePrevPage('behavioral')}
                                            className='pagination-btn'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                            Previous
                                        </button>
                                    )}
                                    
                                    <span className='pagination-info'>
                                        Page {behavioralPage} of {getTotalPages(report.behavioralQuestions)}
                                    </span>
                                    
                                    {behavioralPage < getTotalPages(report.behavioralQuestions) && (
                                        <button 
                                            onClick={() => handleNextPage('behavioral')}
                                            className='pagination-btn'
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    )}
                                </div>
                                
                                {behavioralPage === getTotalPages(report.behavioralQuestions) && (
                                    <button 
                                        onClick={() => handleGenerateMoreQuestions('behavioral')}
                                        disabled={generatingQuestions}
                                        className='generate-more-btn'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        Generate 5 More Questions
                                    </button>
                                )}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {getPaginatedDays(report.preparationPlan, roadmapPage).map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                            
                            <div className='pagination-controls'>
                                <div className='pagination-nav'>
                                    {roadmapPage > 1 && (
                                        <button 
                                            onClick={handlePrevRoadmapPage}
                                            className='pagination-btn'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                            Previous
                                        </button>
                                    )}
                                    
                                    <span className='pagination-info'>
                                        Page {roadmapPage} of {getTotalDaysPages(report.preparationPlan)}
                                    </span>
                                    
                                    {roadmapPage < getTotalDaysPages(report.preparationPlan) && (
                                        <button 
                                            onClick={handleNextRoadmapPage}
                                            className='pagination-btn'
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview