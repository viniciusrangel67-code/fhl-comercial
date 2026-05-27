const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { auditLog } = require("../services/audit");
const router = express.Router();
router.use(authRequired, tenantRequired);

const schema = z.object({
  clientId: z.string().optional(),
  client_id: z.string().optional(),
  number: z.string().min(3),
  opposingParty: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  court: z.string().optional().nullable(),
  phase: z.string().optional().nullable(),
  risk: z.string().optional().nullable()
});

router.get("/", async (req,res)=>{
  const r = await query("select * from processes where office_id=$1 and deleted_at is null order by created_at desc limit 500",[req.officeId]);
  res.json({data:r.rows});
});
router.post("/", async (req,res)=>{
  const b=schema.parse(req.body);
  const clientId=b.clientId||b.client_id;
  const r=await query(`insert into processes (office_id,client_id,number,opposing_party,area,court,phase,risk)
    values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,[req.officeId,clientId,b.number,b.opposingParty||null,b.area||null,b.court||null,b.phase||null,b.risk||"baixo"]);
  await auditLog({userId:req.user.id,officeId:req.officeId,module:"Processos",action:"Criar processo",entityType:"process",entityId:r.rows[0].id,ip:req.ip});
  res.status(201).json({data:r.rows[0]});
});
router.delete("/:id", async (req,res)=>{
  const reason=String(req.body?.reason||"Arquivamento solicitado.");
  const r=await query("update processes set deleted_at=now(), deleted_by=$3, deleted_reason=$4 where id=$1 and office_id=$2 and deleted_at is null returning *",[req.params.id,req.officeId,req.user.id,reason]);
  if(!r.rows[0]) return res.status(404).json({error:true,message:"Processo não encontrado."});
  await auditLog({userId:req.user.id,officeId:req.officeId,module:"Processos",action:"Arquivar processo",entityType:"process",entityId:req.params.id,detail:reason,ip:req.ip});
  res.json({data:r.rows[0]});
});
router.patch("/:id/restore", async (req,res)=>{
  const r=await query("update processes set deleted_at=null, deleted_by=null, deleted_reason=null where id=$1 and office_id=$2 returning *",[req.params.id,req.officeId]);
  if(!r.rows[0]) return res.status(404).json({error:true,message:"Processo não encontrado."});
  res.json({data:r.rows[0]});
});
module.exports = router;
