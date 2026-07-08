const express = require('express');
const reportController = require('../controllers/report.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const reportValidation = require('../validations/report.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.post('/', validate(reportValidation.createReport), reportController.createReport);
router.get('/', authorize(ROLES.ADMIN), reportController.listReports);
router.patch('/:id/resolve', authorize(ROLES.ADMIN), validate(reportValidation.resolveReport), reportController.resolveReport);

router.post('/disputes', validate(reportValidation.createDispute), reportController.createDispute);
router.get('/disputes', authorize(ROLES.ADMIN), reportController.listDisputes);
router.patch('/disputes/:id/resolve', authorize(ROLES.ADMIN), validate(reportValidation.resolveDispute), reportController.resolveDispute);

module.exports = router;
