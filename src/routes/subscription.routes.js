import { Router } from 'express';
import { getSubscribedChannels,getUserChannelSubscribers,
    toggleSubscription, } from '../controller/subscription.controller.js';

import { isUserAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(isUserAuthenticated); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router