# Resume Analyzer

Sistema de análise de currículos usando IA para comparar com descrições de vagas.

## Estrutura do Projeto

- `resume-analyzer-backend/`: API FastAPI com análise de currículos
- `resume-analyzer-frontend/`: Interface React para upload e visualização

## Requisitos

- Python 3.9+
- Node.js 22+
- PostgreSQL 13+
- Docker e Docker Compose (opcional)

## Configuração

### Com Docker

1. Clone o repositório:
```bash
git clone https://github.com/Consultoria-Bethesda/resume-analyzer-frontend.git
cd resume-analyzer-frontend
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
docker-compose up --build
```

### Sem Docker

#### Backend

1. Entre no diretório do backend:
```bash
cd resume-analyzer-backend
```

2. Crie e ative o ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente e inicie:
```bash
cp .env.example .env
uvicorn app.main:app --reload
```

#### Frontend

1. Entre no diretório do frontend:
```bash
cd resume-analyzer-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Uso

1. Acesse o frontend em `http://localhost:8080`
2. API disponível em `http://localhost:8000`
3. Documentação da API em `http://localhost:8000/docs`

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
