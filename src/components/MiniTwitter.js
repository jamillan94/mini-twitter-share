import React, { useState, useEffect } from 'react';
import './MiniTwitter.css'; // Importamos el archivo CSS

// URL base de tu API Gateway
const apiUrl = 'https://zrt7gm51w6.execute-api.us-east-1.amazonaws.com/MiniTwitterApi';

const MiniTwitter = () => {
    const [tweets, setTweets] = useState([]);  // Maneja la lista de tweets
    const [newTweet, setNewTweet] = useState('');  // Maneja el contenido de un nuevo tweet
    const [author, setAuthor] = useState('');  // Maneja el autor del tweet
    const [replies, setReplies] = useState({}); // Maneja las respuestas por cada tweet

    // Función para obtener los tweets desde la API
    const fetchTweets = async () => {
        try {
            const response = await fetch(`${apiUrl}/get-tweets`);
            if (response.ok) {
                const responseData = await response.json();
                
                // Parsear el cuerpo de la respuesta si está presente
                if (responseData.body) {
                    const tweets = JSON.parse(responseData.body);  // Parsear el body que contiene los tweets como string
                    if (Array.isArray(tweets)) {
                        console.log('Datos obtenidos de Lambda:', tweets);
                        setTweets(tweets);  // Actualizar el estado con los tweets obtenidos
                    } else {
                        console.error('La respuesta no contiene un array:', tweets);
                        setTweets([]);  // En caso de error, dejar tweets vacío
                    }
                } else {
                    console.error('Formato de respuesta inesperado:', responseData);
                    setTweets([]);  // En caso de error, dejar tweets vacío
                }
            } else {
                console.error('Error obteniendo los tweets:', response.statusText);
                setTweets([]);  // En caso de error, dejar tweets vacío
            }
        } catch (error) {
            console.error('Error obteniendo los tweets:', error);
            setTweets([]);  // En caso de error, dejar tweets vacío
        }
    };

    useEffect(() => {
        fetchTweets();  // Cargar los tweets cuando se monta el componente
    }, []);

    // Función para crear un nuevo tweet
    const createTweet = async () => {
        const payload = {
            body: JSON.stringify({ content: newTweet, author })
        };

        try {
            const response = await fetch(`${apiUrl}/create-tweet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Tweet creado:', result);  // Verificar el resultado en la consola
            fetchTweets();  // Volver a obtener los tweets después de crear uno nuevo
        } catch (error) {
            console.error('Error creando el tweet:', error);
        }
    };

    // Función para manejar el cambio de texto en la respuesta
    const handleReplyChange = (tweetId, replyContent) => {
        setReplies({
            ...replies,
            [tweetId]: replyContent  // Actualiza el contenido de la respuesta para ese tweet específico
        });
    };

    // Función para manejar la respuesta al tweet
    const handleReply = async (tweetId) => {
        const replyContent = replies[tweetId];  // Obtener la respuesta escrita para este tweet
        const replier = author;  // El autor de la respuesta será el mismo autor de los tweets

        const payload = {
            body: JSON.stringify({ tweetId, replyContent, replier })
        };

        try {
            const response = await fetch(`${apiUrl}/reply-tweet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Respuesta añadida:', result);  // Verificar el resultado en la consola
            fetchTweets();  // Volver a obtener los tweets después de responder
        } catch (error) {
            console.error('Error respondiendo al tweet:', error);
        }
    };

    return (
        <div className="container">
            <h1>Mini Twitter</h1>
            <input
                type="text"
                placeholder="Tu nombre"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
            />
            <input
                type="text"
                placeholder="Escribe tu tweet"
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
            />
            <button onClick={createTweet}>Publicar Tweet</button>

            <ul>
                {tweets.map(tweet => (
                    <li key={tweet.tweetId}>
                        <p>{tweet.author}: {tweet.content}</p>
                        <small>{tweet.createdAt}</small>

                        {/* Input y botón para las respuestas */}
                        <input
                            className="reply-input"
                            type="text"
                            placeholder="Escribe tu respuesta"
                            value={replies[tweet.tweetId] || ''}  // Muestra el valor de la respuesta específica
                            onChange={(e) => handleReplyChange(tweet.tweetId, e.target.value)}
                        />
                        <button className="reply-button" onClick={() => handleReply(tweet.tweetId)}>
                            Responder
                        </button>

                        <div className="replies">
                            {tweet.replies && tweet.replies.map((reply, index) => (
                                <div key={index} className="reply">
                                    <p>{reply.replier}: {reply.replyContent}</p>
                                    <small>{reply.repliedAt}</small>
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MiniTwitter;
