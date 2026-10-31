const { User, Invitation } = require("../models");

// ======================
// LIST ORGANIZATION MEMBERS
// ======================
exports.listMembers = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "You must belong to an organization",
      });
    }

    const members = await User.findAll({
      where: { organizationId },
      attributes: [
        "id",
        "fullName",
        "email",
        "role",
        "isVerified",
        "createdAt",
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error("List members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load members",
      error: error.message,
    });
  }
};

// ======================
// LIST PENDING INVITATIONS
// ======================
exports.listInvitations = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const invitations = await Invitation.findAll({
      where: {
        organizationId,
        status: "pending",
      },
      attributes: ["id", "email", "role", "status", "createdAt", "expiresAt"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { invitations },
    });
  } catch (error) {
    console.error("List invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load invitations",
      error: error.message,
    });
  }
};

// ======================
// UPDATE MEMBER ROLE
// ======================
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const organizationId = req.user.organizationId;

    const allowedRoles = ["admin", "content_creator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const member = await User.findOne({
      where: { id: userId, organizationId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Don't allow changing your own role this way (optional safety)
    if (member.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    member.role = role;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: {
        member: {
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          role: member.role,
        },
      },
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message,
    });
  }
};

module.exports = exports;
