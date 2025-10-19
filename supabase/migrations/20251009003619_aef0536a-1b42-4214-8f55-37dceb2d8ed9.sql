-- Corregir el rol del usuario gerente que fue creado incorrectamente como admin
UPDATE user_roles 
SET role = 'gerente'
WHERE user_id = '649c5859-db38-417b-a433-7210ecf27a38' AND role = 'admin';