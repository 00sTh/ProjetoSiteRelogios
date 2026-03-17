import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — Imports",
  description: "Termos e condições de uso da plataforma Imports.",
};

export default function TermosDeUsoPage() {
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
            Termos de Uso
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

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#9A9A9A" }}>
          <Section title="1. Aceitação dos Termos">
            <p>
              Ao acessar ou usar o site altheia.com.br ("Site") ou realizar uma compra, você
              concorda com estes Termos de Uso. Se não concordar, não utilize o Site.
            </p>
          </Section>

          <Section title="2. Sobre a Plataforma">
            <p>
              O Site é operado pela Imports Comércio de Importados Ltda. e destina-se à venda de produtos
              cosméticos de uso pessoal no território brasileiro. O acesso a determinadas
              funcionalidades requer cadastro e autenticação.
            </p>
          </Section>

          <Section title="3. Cadastro e Conta">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Você deve ter pelo menos 18 anos (ou contar com autorização do responsável
                legal) para se cadastrar.
              </li>
              <li>
                As informações fornecidas no cadastro devem ser verdadeiras, completas e
                atualizadas.
              </li>
              <li>
                Você é responsável pela confidencialidade de sua senha e por todas as
                atividades realizadas em sua conta.
              </li>
              <li>
                A Imports reserva-se o direito de suspender ou encerrar contas que violem
                estes Termos.
              </li>
            </ul>
          </Section>

          <Section title="4. Produtos e Preços">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Os preços exibidos são em reais (R$) e incluem os impostos aplicáveis, exceto
                frete.
              </li>
              <li>
                A Imports reserva-se o direito de alterar preços sem aviso prévio. O preço
                vinculante é o confirmado no momento da finalização do pedido.
              </li>
              <li>
                Imagens dos produtos são meramente ilustrativas. Pode haver variações de cor
                decorrentes da calibração do monitor.
              </li>
              <li>
                A disponibilidade em estoque é verificada no momento do pagamento e pode ser
                alterada antes da confirmação.
              </li>
            </ul>
          </Section>

          <Section title="5. Pedidos e Pagamento">
            <p>
              O pedido é confirmado após a aprovação do pagamento pelo processador (Cielo).
              Reservamo-nos o direito de cancelar pedidos suspeitos de fraude. O pagamento é
              processado de forma segura via Cielo; não armazenamos dados de cartão.
            </p>
          </Section>

          <Section title="6. Entrega">
            <ul className="list-disc pl-5 space-y-1">
              <li>Entregas realizadas somente em território nacional.</li>
              <li>
                Prazos de entrega são estimativas e podem variar conforme a região e
                transportadora.
              </li>
              <li>
                Frete grátis para pedidos acima de R$ 199,00 (consulte condições vigentes).
              </li>
              <li>
                A Imports não se responsabiliza por atrasos causados por transportadoras ou
                eventos de força maior.
              </li>
            </ul>
          </Section>

          <Section title="7. Trocas e Devoluções">
            <p>
              Em conformidade com o Código de Defesa do Consumidor (Art. 49 da Lei 8.078/90):
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>
                <strong style={{ color: "#F5F5F5" }}>Direito de arrependimento:</strong> 7
                dias corridos a partir do recebimento do produto para compras online.
              </li>
              <li>
                <strong style={{ color: "#F5F5F5" }}>Produto com defeito:</strong> 30 dias
                para produtos não-duráveis; 90 dias para duráveis.
              </li>
              <li>O produto deve ser devolvido em sua embalagem original, sem uso.</li>
              <li>
                Solicitações pelo e-mail:{" "}
                <a href="mailto:trocas@altheia.com.br" style={{ color: "#D4AF37" }}>
                  trocas@altheia.com.br
                </a>
              </li>
            </ul>
          </Section>

          <Section title="8. Propriedade Intelectual">
            <p>
              Todo o conteúdo do Site — incluindo textos, imagens, logotipos, design e código
              — é de propriedade da Imports ou de seus licenciadores e protegido por direitos
              autorais. É proibida a reprodução sem autorização prévia por escrito.
            </p>
          </Section>

          <Section title="9. Limitação de Responsabilidade">
            <p>
              A Imports não se responsabiliza por danos indiretos, incidentais ou consequentes
              decorrentes do uso do Site. Nossa responsabilidade total não excederá o valor
              pago pelo produto ou serviço em questão.
            </p>
          </Section>

          <Section title="10. Lei Aplicável e Foro">
            <p>
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
              Gramado — RS para dirimir quaisquer controvérsias, ressalvado o foro do
              domicílio do consumidor conforme o CDC.
            </p>
          </Section>

          <Section title="11. Contato">
            <p>
              Dúvidas:{" "}
              <a href="mailto:contato@altheia.com.br" style={{ color: "#D4AF37" }}>
                contato@altheia.com.br
              </a>
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
      <h2 className="font-serif text-xl font-semibold mb-3" style={{ color: "#F5F5F5" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
