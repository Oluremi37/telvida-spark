const { User, Organization } = require("../models");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { Invitation } = require("../models");

// ======================
// COMPLETE ORGANIZATION SETUP
// ======================
exports.setupOrganization = async (req, res) => {
  try {
    const { name, industry, usage, website } = req.body;
    const userId = req.user.id; // We will get this from the protected route later

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    // Check if user already has an organization
    const existingUser = await User.findByPk(userId);
    if (existingUser.organizationId) {
      return res.status(400).json({
        success: false,
        message: "You already belong to an organization",
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      industry,
      usage: usage || [],
      website,
      ownerId: userId,
    });

    // Link user to the organization
    existingUser.organizationId = organization.id;
    await existingUser.save();

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: {
        organization,
      },
    });
  } catch (error) {
    console.error("Setup organization error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


// ======================
// INVITE TEAM MEMBER
// ======================
exports.inviteTeamMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get current user with organization
    const currentUser = await User.findByPk(userId);

    if (!currentUser.organizationId) {
      return res.status(400).json({
        success: false,
        message: "You must create an organization first",
      });
    }

    // Check if user already exists in the system
    const existingUser = await User.findOne({ where: { email } });
    if (
      existingUser &&
      existingUser.organizationId === currentUser.organizationId
    ) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of your organization",
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invitation
    const invitation = await Invitation.create({
      email,
      role: role || "content_creator",
      organizationId: currentUser.organizationId,
      invitedBy: userId,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Create invite URL
    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite/${token}`;

    // Send invitation email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6B21A8;">You're invited to Telvida Spark!</h2>
        <p>Hi,</p>
        <p><strong>${currentUser.fullName}</strong> has invited you to join their organization on Telvida Spark as a <strong>${role || "Content Creator"}</strong>.</p>
        <a href="${inviteUrl}" 
           style="display: inline-block; background-color: #6B21A8; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Accept Invitation
        </a>
        <p>This invitation will expire in 7 days.</p>
        <br>
        <p>Best regards,<br>The Telvida Spark Team</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: "You've been invited to Telvida Spark",
      html: message,
    });

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
        },
      },
    });
  } catch (error) {
    console.error("Invite team member error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// ACCEPT INVITATION
// ======================
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { fullName, password } = req.body;

    // Find the invitation
    const invitation = await Invitation.findOne({
      where: {
        token,
        status: "pending",
        expiresAt: { [require("sequelize").Op.gt]: Date.now() },
      },
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email: invitation.email } });

    if (user) {
      // User already exists → just link them to the organization
      user.organizationId = invitation.organizationId;
      user.role = invitation.role;
      await user.save();
    } else {
      // Create new user
      if (!fullName || !password) {
        return res.status(400).json({
          success: false,
          message: "Full name and password are required for new users",
        });
      }

      user = await User.create({
        fullName,
        email: invitation.email,
        password,
        role: invitation.role,
        organizationId: invitation.organizationId,
        isVerified: true, // Invited users are auto-verified
      });
    }

    // Mark invitation as accepted
    invitation.status = "accepted";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully. You can now log in.",
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// GET INVITATION DETAILS
// ======================
exports.getInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({
      where: {
        token,
        status: "pending",
        expiresAt: { [require("sequelize").Op.gt]: Date.now() },
      },
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        organizationName: "the organization", // temporary
      },
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};