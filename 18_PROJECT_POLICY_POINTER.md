# OrderFlow — Project Policy Pointer

Policy root: ChatGPT Library `/ENGINEERING-GOVERNANCE`.

Authority order for this repository:
1. `00_MASTER_POLICY.md`
2. global engineering instructions
3. `14_PROJECT_BOOTSTRAP.md`
4. `15_UNIVERSAL_GATESET.yaml`
5. `16_CHANGE_EXECUTION_PROTOCOL.md`
6. `17_PRODUCT_VALIDATION_MATRIX.md`
7. this repository's product-specific constraints

Release rule: no prospect-specific demo is promoted until the generic regression suite and the prospect acceptance suite both pass on a real browser. Any critical-path regression is STOP-THE-LINE.

Product boundary: public demo only, synthetic data only, no real ERP/EDI/WhatsApp/ClickUp integration unless separately implemented and verified. Public facts about prospects may shape scenarios but must never be presented as private knowledge or as an existing commercial relationship.

Rollback baseline: `a4c7136260cb6b90b4906390f72bf91ff1b76397` (documentation HEAD) / validated engine release `ea838457ad4c603731772cf1a8698959f1e657ad`.