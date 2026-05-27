insert into schema_migrations (version, description)
values ('1.3.0','Frontend conectado à API, segurança HTTP, permissões, policies, rotas comerciais e preparação de SaaS vendável')
on conflict (version) do nothing;

insert into policies (kind, version, title, body, active)
values
('privacy','1.0','Política de Privacidade','Tratamos dados pessoais para execução contratual, gestão jurídica, cumprimento de obrigações legais, exercício regular de direitos, segurança, auditoria e suporte. O escritório contratante é controlador dos dados inseridos e a plataforma atua como operadora, salvo hipóteses específicas. Esta política deve ser revisada e personalizada antes da venda em produção.',true),
('terms','1.0','Termos de Uso','O usuário declara possuir autorização do escritório contratante. É vedado compartilhar senhas, tentar acessar dados de terceiros, inserir dados ilícitos ou burlar controles de segurança. Cálculos, documentos e alertas devem ser conferidos pelo profissional responsável.',true)
on conflict (kind, version) do nothing;
