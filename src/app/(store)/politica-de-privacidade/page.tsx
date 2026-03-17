import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Imports",
  description: "Como a Imports coleta, usa e protege seus dados pessoais conforme a LGPD.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}>
      <div className="container mx-auto max-w-3xl px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="label-luxury mb-4" style={{ color: "#D4AF37" }}>
            Legal
          </p>
          <h1
            className="font-serif text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#F5F5F5" }}
          >
            Política de Privacidade
          </h1>
          <p className="text-sm" style={{ color: "rgba(200,187,168,0.5)" }}>
            Última atualização: fevereiro de 2026
          </p>
          <div
            className="h-px mt-6"
            style={{
              background: "linear-gradient(to right, rgba(212,175,55,0.4), transparent)",
            }}
          />
        </div>

        <div
          className="prose-luxury space-y-8 text-sm leading-relaxed"
          style={{ color: "#9A9A9A" }}
        >
          <Section title="1. Quem somos">
            <p>
              Imports Comércio de Importados Ltda., inscrita sob CNPJ 00.000.000/0001-00, com sede na
              Rua das Flores, 100 — Gramado, RS — Brasil ("Imports", "nós" ou "nossos"), é a
              controladora dos dados pessoais coletados através do site altheia.com.br.
            </p>
          </Section>

          <Section title="2. Dados coletados">
            <p>Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>
                <strong style={{ color: "#F5F5F5" }}>Dados de cadastro:</strong> nome, e-mail,
                senha criptografada.
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Dados de pedido:</strong> endereço de
                entrega, CPF (para nota fiscal), histórico de compras.
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Dados de pagamento:</strong> processados
                pela Cielo — não armazenamos dados de cartão de crédito em nossos servidores.
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Dados de navegação:</strong> endereço IP,
                tipo de dispositivo, páginas visitadas (via cookies de análise, com seu
                consentimento).
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Newsletter:</strong> e-mail, se você
                optar por se inscrever.
              </li>
            </ul>
          </Section>

          <Section title="3. Como usamos seus dados">
            <p>Utilizamos seus dados pessoais para:</p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>Processar e entregar seus pedidos;</li>
              <li>Enviar confirmações de compra e atualizações de status;</li>
              <li>Responder dúvidas e solicitações de suporte;</li>
              <li>Enviar comunicações de marketing (somente com seu consentimento);</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </Section>

          <Section title="4. Base legal (LGPD)">
            <p>
              O tratamento de seus dados baseia-se nas seguintes hipóteses legais previstas na
              Lei 13.709/2018 (LGPD):
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>
                <strong style={{ color: "#F5F5F5" }}>Execução de contrato:</strong> dados
                necessários para processar seus pedidos;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Consentimento:</strong> newsletter e
                cookies de análise;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Obrigação legal:</strong> emissão de nota
                fiscal;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Legítimo interesse:</strong> prevenção de
                fraudes e segurança.
              </li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de dados">
            <p>
              Compartilhamos seus dados apenas com parceiros essenciais para a prestação dos
              serviços:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>
                <strong style={{ color: "#F5F5F5" }}>Cielo S.A.:</strong> processamento de
                pagamentos;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Correios / transportadoras:</strong>{" "}
                entrega dos pedidos;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Vercel Inc.:</strong> hospedagem da
                plataforma;
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Clerk Inc.:</strong> autenticação de
                usuários.
              </li>
            </ul>
            <p className="mt-3">
              Não vendemos nem alugamos seus dados a terceiros para fins comerciais.
            </p>
          </Section>

          <Section title="6. Retenção de dados">
            <p>
              Mantemos seus dados pelo tempo necessário para as finalidades descritas ou
              conforme exigido por lei. Dados de pedido são retidos por 5 anos para fins
              fiscais. Você pode solicitar a exclusão de dados não obrigatórios a qualquer
              momento.
            </p>
          </Section>

          <Section title="7. Seus direitos (LGPD Art. 18)">
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar seus dados;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar anonimização, bloqueio ou eliminação;</li>
              <li>Portabilidade dos dados;</li>
              <li>Revogar consentimento a qualquer momento;</li>
              <li>Opor-se ao tratamento.</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato:{" "}
              <a
                href="mailto:privacidade@altheia.com.br"
                style={{ color: "#D4AF37" }}
              >
                privacidade@altheia.com.br
              </a>
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Utilizamos cookies essenciais (necessários para o funcionamento do site) e cookies
              de análise (com seu consentimento). Você pode gerenciar suas preferências de
              cookies nas configurações do seu navegador.
            </p>
          </Section>

          <Section title="9. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
              contra acesso não autorizado, alteração, divulgação ou destruição, incluindo
              criptografia TLS/SSL em todas as transmissões e armazenamento seguro em banco de
              dados.
            </p>
          </Section>

          <Section title="10. Alterações">
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos mudanças
              significativas por e-mail ou via banner no site. A data da última atualização
              está indicada no topo desta página.
            </p>
          </Section>

          <Section title="11. Contato e DPO">
            <p>
              Encarregado de Proteção de Dados (DPO):{" "}
              <a href="mailto:dpo@altheia.com.br" style={{ color: "#D4AF37" }}>
                dpo@altheia.com.br
              </a>
              <br />
              Também é possível registrar reclamações junto à Autoridade Nacional de Proteção
              de Dados (ANPD): www.gov.br/anpd.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        className="font-serif text-xl font-semibold mb-3"
        style={{ color: "#F5F5F5" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
