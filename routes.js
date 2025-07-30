const express = require('express');
const query = require('./services/forge/BBDD_controller');
const postgres = require('./services/forge/BBDD_postgres_controller');

var router = express.Router();

router.get('/query/pg_get_room', postgres.getDataRooms);
router.get('/query/buildingtype', postgres.getBuildingType);
router.get('/query/pg_get_equipment', postgres.getDataEquipment);
router.get('/query/pg_get_columnsEquipment', postgres.getColumnsEquipment);
router.get('/query/pg_get_columnsRoom', postgres.getColumnsRoom);
router.post('/query/pg_post_equipment', postgres.updateDataEquipment);
router.post('/query/pg_post_room', postgres.updateDataRoom);
router.post('/query/pg_post_deleteColumnRoom', postgres.deleteColumnRoom);
router.post('/query/pg_post_deleteColumnEquipment', postgres.deleteColumnEquipment);
router.post('/query/pg_post_addColumnRoom', postgres.addColumnRoom);
router.post('/query/pg_post_addColumnEquipment', postgres.addColumnEquipment);

module.exports = router;
