import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [credits, setCredits] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentProcessed, setPaymentProcessed] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
            console.log('Token não encontrado no CheckoutPage');
            navigate('/login');
            return;
        }

        // Verificar se o token é válido
        const verifyToken = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/payment/verify-credits`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log('Token válido no CheckoutPage');
            } catch (err) {
                console.error('Token inválido no CheckoutPage:', err);
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        };

        verifyToken();
    }, [navigate]);

    // Função para verificar créditos
    const checkCredits = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/payment/verify-credits`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCredits(response.data.remaining_analyses);
        } catch (err) {
            console.error('Erro ao verificar créditos:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        }
    };

    const verifyPayment = async (sessionId) => {
        if (!sessionId || paymentProcessed) return;
        
        try {
            setPaymentProcessed(true);
            const token = localStorage.getItem('authToken');
            
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/payment/verify-payment/${sessionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.status === 'success') {
                const credits = response.data.credits;
                
                navigate('/', { 
                    replace: true,
                    state: { 
                        paymentSuccess: true,
                        message: `Pagamento confirmado! Você tem ${credits} créditos disponíveis.`,
                        credits: credits
                    }
                });
            } else if (response.data.status === 'pending') {
                setError('Pagamento ainda está sendo processado. Por favor, aguarde alguns instantes.');
            }
        } catch (err) {
            console.error('Erro ao verificar pagamento:', err);
            setError('Erro ao verificar pagamento. Por favor, entre em contato com o suporte.');
        }
    };

    useEffect(() => {
        const sessionId = new URLSearchParams(location.search).get('session_id');
        if (sessionId) {
            verifyPayment(sessionId);
        }
    }, [location]);

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null); // Limpar erros anteriores
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Sessão expirada. Por favor, faça login novamente.');
                navigate('/login');
                return;
            }

            console.log('Iniciando requisição de pagamento...'); // Debug
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/payment/create-checkout-session`,
                {}, // corpo vazio
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Resposta recebida:', response.data); // Debug
            
            if (response.data && response.data.url) {
                const message = "Você será redirecionado para a página de pagamento. " +
                              "Os créditos serão liberados automaticamente após a confirmação do pagamento:\n" +
                              "- Cartão de crédito: confirmação imediata\n" +
                              "- Boleto: 1-3 dias úteis após o pagamento";
                
                alert(message);
                window.location.href = response.data.url;
            } else {
                throw new Error('URL de checkout não recebida');
            }
        } catch (error) {
            console.error('Erro detalhado:', error.response?.data || error.message); // Debug detalhado
            setError(
                error.response?.data?.detail || 
                'Erro ao processar pagamento. Por favor, tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const verifyInitialCredits = async () => {
            try {
                await checkCredits();
            } catch (err) {
                console.error('Erro na verificação inicial de créditos:', err);
            }
        };

        verifyInitialCredits();
    }, []);

    return (
        <div className="container">
            <div className="header">
                <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
                <h1>RH Sem Frescura</h1>
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
                    onClick={handlePayment}
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
