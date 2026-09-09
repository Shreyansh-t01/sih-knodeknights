const dataSharingService = require("../services/dataSharing.service");

exports.requestDataShare = async (req, res, next) => {
    try {
        const result = await dataSharingService.requestDataShare({
            dataOwner: req.body.dataOwner,
            dataRequester: req.user.id,
            dataType: req.body.dataType,
            performedBy: req.user.id
        });

        res.status(202).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getJobStatus = async (req, res, next) => {
    try {
        const result = await dataSharingService.getJobStatus(req.params.jobId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
