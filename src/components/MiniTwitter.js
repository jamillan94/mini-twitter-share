import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import './MiniTwitter.css'; // Importamos el archivo CSS

// Configurar las credenciales de AWS manualmente para el entorno local
AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,  // Usar variables de entorno
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION  // Asegúrate de que esta es la región donde tienes las Lambdas
});

const lambda = new AWS.Lambda();

const MiniTwitter = () => {
    const [tweets, setTweets] = useState([]);  // Maneja la lista de tweets
    const [newTweet, setNewTweet] = useState('');  // Maneja el contenido de un nuevo tweet
    const [author, setAuthor] = useState('');  // Maneja el autor del tweet
    const [replies, setReplies] = useState({}); // Maneja las respuestas por cada tweet

    // Función para obtener los tweets desde Lambda
    const fetchTweets = async () => {
        const params = {
            FunctionName: 'GetTweetsFunction',
            InvocationType: 'RequestResponse',
        };

        try {
            const data = await lambda.invoke(params).promise();
            const response = JSON.parse(data.Payload);  // Parsear la respuesta desde Lambda
            
            if (response.body) {
                const tweets = JSON.parse(response.body);  // Parsear el body que contiene los tweets
                console.log('Datos obtenidos de Lambda:', tweets);
                setTweets(tweets);  // Actualizar el estado con los tweets obtenidos
            } else {
                console.error('Formato de respuesta inesperado:', response);
            }
        } catch (error) {
            console.error('Error obteniendo los tweets:', error);
        }
    };

    useEffect(() => {
        fetchTweets();  // Cargar los tweets cuando se monta el componente
    }, []);

    // Función para crear un nuevo tweet
    const createTweet = async () => {
        const params = {
            FunctionName: 'CreateTweetFunction',  // Lambda para crear un tweet
            InvocationType: 'RequestResponse',  // Asegura que espera una respuesta
            Payload: JSON.stringify({
                body: JSON.stringify({ content: newTweet, author })  // Pasar el contenido y el autor del tweet
            })
        };

        try {
            const result = await lambda.invoke(params).promise();
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

        const params = {
            FunctionName: 'ReplyToTweetFunction',  // Lambda para responder al tweet
            InvocationType: 'RequestResponse',  // Asegura que espera una respuesta
            Payload: JSON.stringify({
                body: JSON.stringify({ tweetId, replyContent, replier })
            })
        };

        try {
            const result = await lambda.invoke(params).promise();
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
