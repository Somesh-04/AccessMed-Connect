<?php
// show errors while developing
error_reporting(E_ALL);
ini_set("display_errors", 1);

session_start();
require 'config.php';

$activeTab = 'login';
$successMsg = '';
$errorMsg   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // ---------- SIGNUP ----------
    if ($action === 'signup') {
        $activeTab = 'signup';

        $full_name  = trim($_POST['full_name'] ?? '');
        $user_id    = trim($_POST['user_id'] ?? '');
        $email      = trim($_POST['email'] ?? '');
        $phone      = trim($_POST['phone'] ?? '');
        $password   = $_POST['password'] ?? '';
        $confirm_pw = $_POST['confirm_password'] ?? '';

        if ($password !== $confirm_pw) {
            $errorMsg = "Passwords do not match.";
        } else {
            $check_sql = "SELECT id FROM users WHERE user_id = ? OR email = ?";
            $stmt = $conn->prepare($check_sql);
            $stmt->bind_param("ss", $user_id, $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                $errorMsg = "User ID or Email already exists. Try another.";
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $full_phone = '+91' . $phone;

                $insert_sql = "INSERT INTO users (full_name, user_id, email, phone, password_hash)
                               VALUES (?, ?, ?, ?, ?)";
                $insert_stmt = $conn->prepare($insert_sql);
                $insert_stmt->bind_param("sssss", $full_name, $user_id, $email, $full_phone, $hash);

                if ($insert_stmt->execute()) {
                    $successMsg = "Signup successful! You can now login.";
                    $activeTab = 'login';
                } else {
                    $errorMsg = "Error while signing up. Please try again.";
                }

                $insert_stmt->close();
            }

            $stmt->close();
        }
    }

    // ---------- LOGIN ----------
    if ($action === 'login') {
        $activeTab = 'login';

        $identifier = trim($_POST['identifier'] ?? '');
        $password   = $_POST['password'] ?? '';

        $sql = "SELECT id, full_name, user_id, email, password_hash
                FROM users
                WHERE user_id = ? OR email = ?
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $row = $result->fetch_assoc()) {
            if (password_verify($password, $row['password_hash'])) {
                $_SESSION['user_id']   = $row['id'];
                $_SESSION['full_name'] = $row['full_name'];
                $successMsg = "Login successful! Welcome, " . htmlspecialchars($row['full_name']) . ".";
            } else {
                $errorMsg = "Invalid password.";
            }
        } else {
            $errorMsg = "No user found with that User ID or Email.";
        }

        $stmt->close();
    }

    // ---------- RESET PASSWORD ----------
    if ($action === 'reset') {
        $activeTab = 'reset';

        $identifier = trim($_POST['identifier'] ?? '');
        $new_pw     = $_POST['new_password'] ?? '';
        $confirm_pw = $_POST['confirm_new_password'] ?? '';

        if ($new_pw !== $confirm_pw) {
            $errorMsg = "New passwords do not match.";
        } else {
            $sql = "SELECT id FROM users WHERE user_id = ? OR email = ? LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $identifier, $identifier);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result && $row = $result->fetch_assoc()) {
                $userId = $row['id'];
                $hash   = password_hash($new_pw, PASSWORD_DEFAULT);

                $update_sql = "UPDATE users SET password_hash = ? WHERE id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("si", $hash, $userId);

                if ($update_stmt->execute()) {
                    $successMsg = "Password updated successfully. You can now login with your new password.";
                    $activeTab  = 'login';
                } else {
                    $errorMsg = "Error updating password. Please try again.";
                }

                $update_stmt->close();
            } else {
                $errorMsg = "No user found with that User ID or Email.";
            }

            $stmt->close();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AccessMed Connect – Auth</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }

        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: radial-gradient(circle at top left, #6d28d9, #4f46e5 40%, #0f172a 90%);
            color: #0f172a;
        }

        .auth-layout {
            width: 100%;
            max-width: 980px;
            min-height: 520px;
            background: #0b1220;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 60px rgba(15, 23, 42, 0.7);
            display: flex;
        }

        .auth-left {
            flex: 0 0 45%;
            background: linear-gradient(145deg, #22c55e 0%, #16a3ff 50%, #0f172a 100%);
            padding: 32px 28px;
            position: relative;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .brand-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-row img.logo {
            height: 48px;
            width: 48px;
            border-radius: 14px;
        }

        .brand-name-main {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }

        .brand-name-sub {
            font-size: 11px;
            opacity: 0.8;
        }

        .left-main-text {
            margin-top: 40px;
        }

        .left-main-text h1 {
            font-size: 28px;
            line-height: 1.2;
            margin-bottom: 10px;
        }

        .left-main-text p {
            font-size: 14px;
            max-width: 260px;
            opacity: 0.9;
        }

        .left-badge {
            align-self: flex-start;
            margin-top: 18px;
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(15,23,42,0.35);
            border: 1px solid rgba(248,250,252,0.35);
        }

        /* removed white glow bubble */

        .auth-right {
            flex: 0 0 55%;
            background: #0b1120;
            padding: 32px 40px;
            color: #e5e7eb;
            display: flex;
            flex-direction: column;
        }

        .toggle-btns {
            display: inline-flex;
            border-radius: 999px;
            background: #020617;
            padding: 3px;
            margin-bottom: 18px;
        }

        .toggle-btns button {
            border: none;
            background: transparent;
            color: #9ca3af;
            padding: 7px 16px;
            border-radius: 999px;
            cursor: pointer;
            font-size: 13px;
            transition: 0.2s;
        }

        .toggle-btns button.active {
            background: #4f46e5;
            color: #f9fafb;
        }

        .headline {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .subhead {
            font-size: 13px;
            color: #9ca3af;
            margin-bottom: 16px;
        }

        .message {
            margin-bottom: 12px;
            padding: 8px 10px;
            border-radius: 10px;
            font-size: 13px;
        }

        .message.error {
            background: rgba(248, 113, 113, 0.18);
            border: 1px solid rgba(248, 113, 113, 0.7);
            color: #fecaca;
        }

        .message.success {
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid rgba(34, 197, 94, 0.7);
            color: #bbf7d0;
        }

        .form { display: none; }
        .form.active { display: block; }

        .form-group { margin-bottom: 12px; }

        label {
            display: block;
            font-size: 13px;
            margin-bottom: 4px;
            color: #e5e7eb;
        }

        input {
            width: 100%;
            padding: 10px 11px;
            border-radius: 10px;
            border: 1px solid #1f2937;
            background: #020617;
            color: #f9fafb;
            font-size: 13px;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        input::placeholder { color: #6b7280; }

        input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.55);
            background: #020617;
        }

        .phone-box { display: flex; gap: 6px; }

        .phone-box span {
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #1f2937;
            background: #020617;
            font-size: 13px;
            color: #e5e7eb;
            white-space: nowrap;
        }

        .submit-btn {
            width: 100%;
            padding: 11px;
            margin-top: 6px;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            color: #f9fafb;
            box-shadow: 0 12px 30px rgba(79, 70, 229, 0.6);
            transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 40px rgba(79, 70, 229, 0.78);
        }

        .submit-btn:active {
            transform: translateY(0);
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.55);
        }

        .bottom-note {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
        }

        .bottom-note span {
            color: #e5e7eb;
            font-weight: 500;
            cursor: pointer;
        }

        .password-group .input-wrapper {
            display: flex;
            align-items: center;
            position: relative;
        }

        .password-group input { padding-right: 34px; }

        .eye-btn {
            position: absolute;
            right: 9px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 17px;
            color: #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .eye-btn:hover { color: #e5e7eb; }

        .eye-btn::before { content: "👁"; }

        .eye-btn.visible { color: #a5b4fc; }

        .forgot-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
            margin-bottom: 4px;
        }

        .forgot-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 12px;
            color: #a5b4fc;
            padding: 0;
        }

        .forgot-btn:hover { text-decoration: underline; }

        .welcome {
            margin-top: 10px;
            font-size: 13px;
            color: #a7f3d0;
        }

        @media (max-width: 820px) {
            .auth-layout {
                flex-direction: column;
                max-width: 460px;
            }
            .auth-left { min-height: 180px; }
        }
    </style>
</head>
<body>

<div class="auth-layout">
    <!-- LEFT PANEL -->
    <div class="auth-left">
        <div>
            <div class="brand-row">
                <img src="logo.jpg" alt="AccessMed Connect logo" class="logo">
                <div>
                    <div class="brand-name-main">ACCESSMED</div>
                    <div class="brand-name-sub">CONNECT</div>
                </div>
            </div>

            <div class="left-main-text">
                <h1>Smart access to<br>your medical services.</h1>
                <p>Securely sign in to manage appointments, prescriptions and health records in one place.</p>
                <div class="left-badge">Trusted access • Secure by design</div>
            </div>
        </div>
        <!-- removed decor-bubble div so no white patch -->
    </div>

    <!-- RIGHT PANEL -->
    <div class="auth-right">
        <!-- top "New here? Create account" removed -->

        <div class="toggle-btns">
            <button id="btn-login"  class="<?php echo ($activeTab === 'login') ? 'active' : ''; ?>">Login</button>
            <button id="btn-signup" class="<?php echo ($activeTab === 'signup') ? 'active' : ''; ?>">Signup</button>
        </div>

        <div class="headline">
            <?php
            if ($activeTab === 'signup') echo "Create your AccessMed account";
            elseif ($activeTab === 'reset') echo "Reset your password";
            else echo "Welcome back 👋";
            ?>
        </div>
        <div class="subhead">
            <?php
            if ($activeTab === 'signup')
                echo "Fill in your details to get started with AccessMed Connect.";
            elseif ($activeTab === 'reset')
                echo "Enter your User ID or email and choose a new password.";
            else
                echo "Sign in using your User ID or email to continue.";
            ?>
        </div>

        <?php if (!empty($errorMsg)): ?>
            <div class="message error"><?php echo htmlspecialchars($errorMsg); ?></div>
        <?php endif; ?>

        <?php if (!empty($successMsg)): ?>
            <div class="message success"><?php echo htmlspecialchars($successMsg); ?></div>
        <?php endif; ?>

        <!-- LOGIN FORM -->
        <form id="login-form" class="form <?php echo ($activeTab === 'login') ? 'active' : ''; ?>" method="post">
            <div class="form-group">
                <label>User ID or Email</label>
                <input type="text" name="identifier" placeholder="Enter user ID or email" required>
            </div>

            <div class="form-group password-group">
                <label>Password</label>
                <div class="input-wrapper">
                    <input type="password" name="password" placeholder="Enter password" required>
                    <button type="button" class="eye-btn" aria-label="Show password"></button>
                </div>
            </div>

            <div class="forgot-row">
                <button type="button" class="forgot-btn" id="forgot-btn">
                    Forgot password?
                </button>
            </div>

            <input type="hidden" name="action" value="login">
            <button type="submit" class="submit-btn">Login</button>

            <div class="bottom-note">
                New to AccessMed? <span id="bottom-switch-login">Create an account</span>
            </div>
        </form>

        <!-- SIGNUP FORM -->
        <form id="signup-form" class="form <?php echo ($activeTab === 'signup') ? 'active' : ''; ?>" method="post">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="full_name" placeholder="Enter full name" required>
            </div>

            <div class="form-group">
                <label>User ID</label>
                <input type="text" name="user_id" placeholder="Choose a unique user ID" required>
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="Enter email address" required>
            </div>

            <div class="form-group">
                <label>Phone Number</label>
                <div class="phone-box">
                    <span>+91</span>
                    <input type="tel" name="phone" placeholder="10-digit number" pattern="[0-9]{10}" required>
                </div>
            </div>

            <div class="form-group password-group">
                <label>Password</label>
                <div class="input-wrapper">
                    <input type="password" name="password" placeholder="Create a password" required>
                    <button type="button" class="eye-btn" aria-label="Show password"></button>
                </div>
            </div>

            <div class="form-group password-group">
                <label>Confirm Password</label>
                <div class="input-wrapper">
                    <input type="password" name="confirm_password" placeholder="Re-enter password" required>
                    <button type="button" class="eye-btn" aria-label="Show password"></button>
                </div>
            </div>

            <input type="hidden" name="action" value="signup">
            <button type="submit" class="submit-btn">Create account</button>

            <div class="bottom-note">
                Already registered? <span id="bottom-switch-signup">Sign in</span>
            </div>
        </form>

        <!-- RESET PASSWORD FORM -->
        <form id="reset-form" class="form <?php echo ($activeTab === 'reset') ? 'active' : ''; ?>" method="post">
            <div class="form-group">
                <label>User ID or Email</label>
                <input type="text" name="identifier" placeholder="Enter user ID or email" required>
            </div>

            <div class="form-group password-group">
                <label>New Password</label>
                <div class="input-wrapper">
                    <input type="password" name="new_password" placeholder="Enter new password" required>
                    <button type="button" class="eye-btn" aria-label="Show password"></button>
                </div>
            </div>

            <div class="form-group password-group">
                <label>Confirm New Password</label>
                <div class="input-wrapper">
                    <input type="password" name="confirm_new_password" placeholder="Re-enter new password" required>
                    <button type="button" class="eye-btn" aria-label="Show password"></button>
                </div>
            </div>

            <input type="hidden" name="action" value="reset">
            <button type="submit" class="submit-btn">Update password</button>

            <div class="bottom-note">
                Remember your password? <span id="bottom-switch-reset">Back to login</span>
            </div>
        </form>

        <?php if (isset($_SESSION['full_name'])): ?>
            <div class="welcome">
                Logged in as <strong><?php echo htmlspecialchars($_SESSION['full_name']); ?></strong>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
    const btnLogin   = document.getElementById("btn-login");
    const btnSignup  = document.getElementById("btn-signup");
    const loginForm  = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const resetForm  = document.getElementById("reset-form");

    const bottomLoginSwitch  = document.getElementById("bottom-switch-login");
    const bottomSignupSwitch = document.getElementById("bottom-switch-signup");
    const bottomResetSwitch  = document.getElementById("bottom-switch-reset");
    const forgotBtn          = document.getElementById("forgot-btn");

    function showLogin() {
        btnLogin.classList.add("active");
        btnSignup.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        resetForm.classList.remove("active");
    }

    function showSignup() {
        btnSignup.classList.add("active");
        btnLogin.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        resetForm.classList.remove("active");
    }

    function showReset() {
        btnLogin.classList.remove("active");
        btnSignup.classList.remove("active");
        resetForm.classList.add("active");
        loginForm.classList.remove("active");
        signupForm.classList.remove("active");
    }

    btnLogin.addEventListener("click", showLogin);
    btnSignup.addEventListener("click", showSignup);

    if (forgotBtn) forgotBtn.addEventListener("click", showReset);
    if (bottomLoginSwitch)  bottomLoginSwitch.addEventListener("click", showSignup);
    if (bottomSignupSwitch) bottomSignupSwitch.addEventListener("click", showLogin);
    if (bottomResetSwitch)  bottomResetSwitch.addEventListener("click", showLogin);

    // Eye icon: toggle password visibility
    document.querySelectorAll(".password-group .eye-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.parentElement.querySelector("input");
            if (input.type === "password") {
                input.type = "text";
                btn.classList.add("visible");
            } else {
                input.type = "password";
                btn.classList.remove("visible");
            }
        });
    });
</script>

</body>
</html>
