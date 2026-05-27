const bcrypt = require("bcryptjs");
const { query } = require("../src/db");
const { config } = require("../src/config");

async function main() {
  const office = await query(
    `insert into offices (name, slug, email, plan_code, trial_ends_at)
     values ('Escritório Demonstração', 'demo', 'admin@demo.com', $1, now() + interval '14 days')
     on conflict (slug) do update set updated_at=now()
     returning *`,
    [config.saas.defaultPlan]
  );

  const hash = await bcrypt.hash("123456", config.bcryptRounds);
  await query(
    `insert into users (office_id, name, email, password_hash, role)
     values ($1,'Administrador Demo','admin@demo.com',$2,'admin')
     on conflict (office_id, email) do update set password_hash=$2, role='admin', active=true`,
    [office.rows[0].id, hash]
  );

  await query(
    `insert into subscriptions (office_id, plan_code, status, current_period_start, current_period_end)
     values ($1,$2,'trial',current_date,current_date + interval '14 days')
     on conflict do nothing`,
    [office.rows[0].id, config.saas.defaultPlan]
  );

  console.log("Demo criado:", office.rows[0].id, "admin@demo.com / 123456");
  process.exit(0);
}
main().catch((error) => { console.error(error); process.exit(1); });
