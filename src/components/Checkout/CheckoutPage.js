import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const verifyPayment = async (sessionId) => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Verificando pagamento...');
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/payment/verify-payment/${sessionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('Resposta da verificação:', response.data);
            
            if (response.data.status === 'success') {
                navigate('/', { 
                    replace: true, 
                    state: { 
                        refresh: true,
                        paymentSuccess: true 
                    }
                });
            }
        } catch (err) {
            console.error('Erro ao verificar pagamento:', err);
            setError('Erro ao verificar pagamento');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (sessionId) {
            console.log('Session ID encontrado:', sessionId);
            verifyPayment(sessionId);
        }
    }, [location, navigate, verifyPayment]);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/payment/create-checkout-session`,
                {
                    payment_method_types: ['card', 'boleto']
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            window.location.href = response.data.checkout_url;
        } catch (err) {
            console.error('Erro ao iniciar checkout:', err);
            setError('Erro ao processar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
                <h1>CV Sem Frescura</h1>
                <button onClick={() => navigate('/')} className="back-button">
                    Voltar
                </button>
            </div>

            <div className="checkout-card">
                <h2>Plano de Análise de CV</h2>
                <div className="price-box">
                    <span className="price">R$ 29,97</span>
                    <span className="period">por pacote</span>
                </div>

                <div className="features">
                    <h3>O que está incluído:</h3>
                    <ul>
                        <li>4 análises completas de CV</li>
                        <li>2 vagas por análise (total de 8 vagas)</li>
                        <li>Recomendações personalizadas</li>
                        <li>Análise com IA avançada</li>
                        <li>Suporte por email</li>
                    </ul>
                </div>

                <div className="payment-methods">
                    <h3>Formas de Pagamento:</h3>
                    <ul>
                        <li>💳 Cartão de Crédito</li>
                        <li>📄 Boleto Bancário</li>
                    </ul>
                </div>

                <button 
                    className="checkout-button"
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="loading-spinner"></span>
                            Processando...
                        </>
                    ) : (
                        'Comprar Agora'
                    )}
                </button>

                {error && <div className="error-message">{error}</div>}

                <div className="secure-info">
                    <span>🔒 Pagamento seguro via Stripe</span>
                </div>

                <div className="checkout-footer">
                    <p>Ao realizar a compra, você concorda com nossos Termos de Serviço</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;