const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user.js");

passport .use(
    new GoogleStrategy(
        {
            clientID : process.env.GOOGLE_CLIENT_ID ,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET ,
            callbackURL : process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                //check if user already exists
                let user = await User.findOne({ googlrId : profile.id });

                if (!user) {
                    //Create new user
                    user = new User({
                        googleId : profile.id,
                        username : profile.displayName,
                        email : profile.emails[0].value,
                        profilePic : profile.photos[0].value,
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});