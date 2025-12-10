# 🔧 Quick Fix: CodeBuild Permission Errors

## Error 1: CodeConnections Access Denied

**Error Message:**
```
CLIENT_ERROR: Failed to get access token from arn:aws:codeconnections:us-east-1:971781420507:connection/738521d7-b0c7-48f5-88ba-995bd111d555: Access denied
```

### Solution (5 Minutes)

1. **Open IAM Console:**
   - Go to: https://console.aws.amazon.com/iam
   - Or search "IAM" in AWS search bar

2. **Find Your CodeBuild Role:**
   - Click **"Roles"** (left sidebar)
   - Search for: `CodeBuildServiceRole-blog-build`
   - Click on the role name

3. **Add CodeConnections Policy:**
   - Click **"Add permissions"** button
   - Click **"Create inline policy"**
   - Click **"JSON"** tab (at the top)
   - **Delete** any existing text
   - **Paste** this exact policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "codeconnections:UseConnection"
            ],
            "Resource": "arn:aws:codeconnections:*:*:connection/*"
        }
    ]
}
```

   - Click **"Next"** button
   - **Policy name:** `CodeBuild-CodeConnections-Access`
   - Click **"Create policy"** button

4. **Verify It Was Added:**
   - You should see the policy listed under "Permissions policies"
   - The policy name should be: `CodeBuild-CodeConnections-Access`

5. **Test:**
   - Go back to CodeBuild Console
   - Click on your project: `blog-build`
   - Click **"Start build"**
   - The error should be fixed!

---

## Error 2: ECR Login Failed

**Error Message:**
```
Error while executing command: aws ecr get-login-password ... exit status 1
```

### Solution (5 Minutes)

1. **Open IAM Console:**
   - Go to: https://console.aws.amazon.com/iam
   - Click **"Roles"**
   - Search for: `CodeBuildServiceRole-blog-build`
   - Click on the role name

2. **Add ECR Permissions:**
   - Click **"Add permissions"** button
   - Click **"Attach policies"**
   - In the search box, type: `AmazonEC2ContainerRegistryFullAccess`
   - ✅ **Check the box** next to `AmazonEC2ContainerRegistryFullAccess`
   - Click **"Add permissions"** button

3. **Verify Environment Variables:**
   - Go to CodeBuild Console: https://console.aws.amazon.com/codesuite/codebuild
   - Click on project: `blog-build`
   - Click **"Edit"** → Scroll to **"Environment"** section
   - Check **"Environment variables"**:
     - ✅ `AWS_ACCOUNT_ID` = `971781420507` (your account ID)
     - ✅ `AWS_DEFAULT_REGION` = `us-east-1` (your region)
   - If missing, click **"Add environment variable"** and add them

4. **Test:**
   - Click **"Start build"**
   - Build should now succeed!

---

## Complete Permission Setup (Do All Steps)

To ensure everything works, add **BOTH** permissions:

### Step 1: CodeConnections Permission

1. IAM → Roles → `CodeBuildServiceRole-blog-build`
2. Add permissions → Create inline policy → JSON
3. Paste CodeConnections policy (see Error 1 above)
4. Name: `CodeBuild-CodeConnections-Access`
5. Create policy

### Step 2: ECR Permission

1. Still in the same role
2. Add permissions → Attach policies
3. Search: `AmazonEC2ContainerRegistryFullAccess`
4. Check box → Add permissions

### Step 3: Verify Environment Variables

1. CodeBuild Console → Edit project
2. Environment → Environment variables
3. Ensure these exist:
   - `AWS_ACCOUNT_ID` = `971781420507`
   - `AWS_DEFAULT_REGION` = `us-east-1`

### Step 4: Verify ECR Repositories Exist

1. Go to ECR Console: https://console.aws.amazon.com/ecr
2. Verify these repositories exist:
   - ✅ `blog-backend`
   - ✅ `blog-frontend`
3. If missing, create them (see deployment guide)

---

## Quick Checklist

After following the steps above, verify:

- [ ] CodeConnections policy added to service role
- [ ] ECR Full Access policy attached to service role
- [ ] `AWS_ACCOUNT_ID` environment variable set in CodeBuild
- [ ] `AWS_DEFAULT_REGION` environment variable set in CodeBuild
- [ ] ECR repositories `blog-backend` and `blog-frontend` exist
- [ ] Build started successfully in CodeBuild

---

## Error 3: YAML File Error in buildspec.yml

**Error Message:**
```
YAML_FILE_ERROR: Expected Commands[2] to be of string type: found subkeys instead at line X
```

### Solution

This error means there's a syntax error in your `buildspec.yml` file. CodeBuild doesn't support multi-line YAML blocks (`|`) in commands.

**Fix:**
1. Open `infra/buildspec.yml` in your repository
2. Make sure all commands are on single lines (no `|` block scalars)
3. Use `&&` or `||` to chain commands instead of multi-line blocks
4. Example of correct format:

```yaml
commands:
  - echo "Single line command"
  - if [ condition ]; then command && exit 1; fi
  - command1 | command2 || (error && exit 1)
```

**The buildspec.yml file in your repository should already be fixed.**
- Just commit and push the updated file
- Or manually verify the file matches the corrected version

---

## Still Having Issues?

If you still see errors after following these steps:

1. **Check Build Logs:**
   - CodeBuild Console → Build history → Click on failed build → View logs
   - Look for the exact error message

2. **Verify Role Name:**
   - Make sure you're editing the correct role
   - Role name should match what CodeBuild is using
   - Check in CodeBuild project settings → Service role

3. **Wait a Few Minutes:**
   - IAM permission changes can take 1-2 minutes to propagate
   - Wait 2-3 minutes after adding permissions before retrying

4. **Try Alternative: Use GitHub Token Instead**
   - If CodeConnections continues to fail, use Personal Access Token:
   - CodeBuild → Edit → Source → GitHub → Personal access token
   - Generate token at: https://github.com/settings/tokens

---

**That's it! Your CodeBuild should now work correctly.** 🎉

