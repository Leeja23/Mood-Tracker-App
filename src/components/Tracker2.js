import React, { useState } from 'react';  
import { GoogleGenerativeAI } from '@google/generative-ai';  
import Calendar from 'react-calendar';  
import 'react-calendar/dist/Calendar.css';  
import './Tracker2.css';  

export default function CalendarGfg() {  
    const [value, onChange] = useState(new Date());  
    const [situation, setSituation] = useState('');  
    const [feeling, setFeeling] = useState('');  
    const [suggestion, setSuggestion] = useState('');  
    const [showInput, setShowInput] = useState(false);  
    const [moods, setMoods] = useState(JSON.parse(localStorage.getItem('moods')) || {});  
    const [debouncedTimeout, setDebouncedTimeout] = useState(null);  
    const [isSaving, setIsSaving] = useState(false);  

    const handleDateClick = (date) => {  
        onChange(date);  
        setShowInput(true);  
        const dateString = formatDate(date);  
        const moodData = moods[dateString] || {};  
        setSituation(moodData.situation || '');  
        setFeeling(moodData.feeling || '');  
        setSuggestion(moodData.suggestion || '');  
    };  

    const formatDate = (date) => {  
        const options = { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' };  
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)  
            .toLocaleDateString('en-US', options);  
    };  

    const generateAIResponse = async (text) => {  
        try {  
            const genAI = new GoogleGenerativeAI("AIzaSyATYzXkbtR6WbJotEajoJljfVVhkBq8mKs");  
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  

            const feelingPrompt = `Based on the given text, generate the feelings in one word: ${text}, Options: Happy, Sad, Natural, Bad, Angry`;  
            const feelingResult = await model.generateContent(feelingPrompt);  
            const feeling = feelingResult.response.text() || "Neutral";   

            const suggestionPrompt = `Provide a suggestion based on my text: ${feeling}`;  
            const suggestionResult = await model.generateContent(suggestionPrompt);  
            const suggestion = suggestionResult.response.text() || "Take it easy.";   

            return { feeling, suggestion };  
        } catch (error) {  
            console.error('Error generating AI response:', error);  
            return { feeling: "Neutral", suggestion: "Take it easy." };  
        }  
    };  

    const handleSituationChange = (e) => {  
        const text = e.target.value;  
        setSituation(text);  

        if (debouncedTimeout) {  
            clearTimeout(debouncedTimeout);  
        }  

        const newTimeout = setTimeout(() => {  
            generateAIResponse(text).then(({ feeling, suggestion }) => {  
                setFeeling(feeling);  
                setSuggestion(suggestion);  
            });  
        }, 1000);   

        setDebouncedTimeout(newTimeout);  
    };  

    const handleMoodSave = async () => {  
        if (isSaving) return;  
        setIsSaving(true);  

        if (situation.trim() !== '') {  
            const dateString = formatDate(value);  

            const { feeling: newFeeling, suggestion: newSuggestion } = await generateAIResponse(situation);  

            const updatedMoods = {  
                ...moods,  
                [dateString]: {  
                    situation,  
                    feeling: newFeeling,  
                    suggestion: newSuggestion,  
                },  
            };  

            setMoods(updatedMoods);  
            localStorage.setItem('moods', JSON.stringify(updatedMoods));  

            alert(`Mood saved for ${dateString}: ${newFeeling}\nSuggestion: ${newSuggestion}`);  
            setFeeling(newFeeling);   
            setSuggestion(newSuggestion);   
            setSituation('');   
        } else {  
            alert('Please enter a situation before saving.');  
        }  
        setIsSaving(false);  
    };  

    const handleMoodDelete = (dateString) => {  
        const updatedMoods = { ...moods };  
        delete updatedMoods[dateString];  
        setMoods(updatedMoods);  
        localStorage.setItem('moods', JSON.stringify(updatedMoods));  
        alert(`Mood deleted for ${dateString}`);  
    };  

    return (  
        <div style={styles.container}>  
            <h1 style={styles.heading}>Mood Tracker</h1>  
            <div style={styles.calendarWrapper}>  
                <Calendar
                    onChange={handleDateClick}  
                    value={value}
                    style={styles.calendar}
                />
            </div>  
            {showInput && (  
                <div style={styles.inputContainer}>  
                    <label style={styles.label}>  
                        Describe your day for {formatDate(value)}:  
                    </label>  
                    <textarea  
                        value={situation}  
                        onChange={handleSituationChange}  
                        style={styles.textarea}  
                    />  
                    <button onClick={handleMoodSave} style={styles.button} disabled={isSaving}>  
                        {isSaving ? 'Saving...' : 'Save Mood'}  
                    </button>  
                </div>  
            )}  
            <div style={styles.moodList}>  
                <h2 style={styles.subHeading}>Your Moods:</h2>  
                {Object.keys(moods).length > 0 ? (  
                    Object.entries(moods).map(([date, moodData]) => (  
                        <div key={date} style={styles.moodItem}>  
                            <span>  
                                <strong>{date}:</strong> {moodData.situation} <br />  
                                <strong>Feeling:</strong> {moodData.feeling} <br />  
                                <strong>Suggestion:</strong> {moodData.suggestion}  
                            </span>  
                            <button  
                                onClick={() => {  
                                    onChange(new Date(date));  
                                    setSituation(moodData.situation);  
                                    setFeeling(moodData.feeling);  
                                    setSuggestion(moodData.suggestion);  
                                    setShowInput(true);  
                                }}  
                                style={styles.editButton}  
                            >  
                                Edit  
                            </button>  
                            <button  
                                onClick={() => handleMoodDelete(date)}  
                                style={styles.deleteButton}  
                            >  
                                Delete  
                            </button>  
                        </div>  
                    ))  
                ) : (  
                    <p style={styles.noMoods}>No moods recorded yet.</p>  
                )}  
            </div>  
        </div>  
    );  
}  

const styles = {  
    container: {  
        height: '80vh',  
        width: '100vw',  
        padding: '20px',  
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  
        borderRadius: '8px',   
        marginBottom: "100px" ,
        color:"black" ,
        justifyContent:"center",
        alignItem:"center",
    },  

    heading: {  
        textAlign: 'center',  
        fontSize: '2em',  
        marginBottom: '20px',   
        fontWeight: 'bold',   
        boxShadow: '10px 10px 10px 10px rgba(0, 0, 0, 0.1)',   
    },  

    calendarWrapper: {  
        margin: '20px 0',  
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',  
        borderRadius: '5px',
    },  

    calendar: {  
        width: '90%',  
        height: '500px',  
        fontSize: '1.2em',  
        margin: '0 auto',  
    },  
    inputContainer: {  
        margin: '20px 0',  
    },  
    label: {  
        display: 'block',  
        marginBottom: '10px',  
        fontWeight: '600',  
    },  
    textarea: {  
        width: '100%',  
        height: '100px',  
        padding: '10px',  
        fontSize: '1em',  
        borderRadius: '5px',  
        border: '1px solid #ccc',  
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',  
        transition: 'box-shadow 0.3s ease',  
    },  
    button: {  
        padding: '10px 20px',  
        fontSize: '1em',  
        cursor: 'pointer',  
        borderRadius: '5px',  
        background: '#007bff',  
        height: '50px',  
        width: '200px',  
        color: 'white',  
        border: 'none',  
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)',  
        marginTop: '10px',  
    },  
    moodList: {  
        marginTop: '20px',  
        paddingTop: '20px',  
    },  
    subHeading: {  
        fontSize: '1.5em',  
        marginBottom: '20px',  
        textAlign: 'center',  
    },  
    moodItem: {  
        backgroundColor: '#f9f9f9',  
        padding: '15px',  
        borderRadius: '5px',  
        marginBottom: '15px',  
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',  
    },  
    editButton: {  
        marginTop: '10px',  
        padding: '5px 10px',  
        fontSize: '1em',  
        backgroundColor: '#28a745',  
        color: 'white',  
        border: 'none',  
        borderRadius: '5px',  
        cursor: 'pointer', 
        height:"60px",
        width:"70px" ,
        marginRight:"20px"

    },  
    deleteButton: {  
        marginTop: '10px',  
        padding: '5px 10px',  
        fontSize: '1em',  
        backgroundColor: '#dc3545',  
        color: 'white',  
        border: 'none',  
        borderRadius: '5px',  
        cursor: 'pointer',  
        height:"60px",
        width:"70px" ,
        marginRight:"20px"
    },  
    noMoods: {  
        textAlign: 'center',  
        color: 'gray',  
        fontSize: '1.2em',  
    },  
};
