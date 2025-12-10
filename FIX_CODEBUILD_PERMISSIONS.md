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

## Error 4: Docker Hub Rate Limit (429 Too Many Requests)

**Error Message:**
```
429 Too Many Requests - You have reached your unauthenticated pull rate limit
```

**This error means:** Docker Hub has rate limits. CodeBuild has hit the limit for pulling public images.

### Solution - Option 1: Use ECR Public Gallery (Recommended - Already Fixed!)

**✅ The Dockerfiles have already been updated to use ECR Public Gallery instead of Docker Hub.**

**What changed:**
- `FROM node:18-alpine` → `FROM public.ecr.aws/docker/library/node:18-alpine`
- ECR Public Gallery has no rate limits for public images
- No authentication required for public images

**Next steps:**
1. Commit and push the updated Dockerfiles:
   ```bash
   git add backend/Dockerfile frontend/Dockerfile infra/buildspec.yml
   git commit -m "Switch to ECR Public Gallery to avoid Docker Hub rate limits"
   git push origin main
   ```

2. Retry your CodeBuild build
3. The rate limit error should be resolved!

### Solution - Option 2: Use Docker Hub Authentication (Alternative)

If you prefer to use Docker Hub:

1. **Create Docker Hub Account:**
   - Go to: https://hub.docker.com/signup
   - Create a free account

2. **Get Docker Hub Credentials:**
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password (or create access token)

3. **Add to CodeBuild Environment Variables:**
   - CodeBuild Console → Edit project
   - Environment → Environment variables
   - Add:
     - **Name:** `DOCKERHUB_USERNAME`
     - **Value:** Your Docker Hub username
     - **Type:** Plaintext
   - Add:
     - **Name:** `DOCKERHUB_PASSWORD`
     - **Value:** Your Docker Hub password/token
     - **Type:** Plaintext (or Secrets Manager for security)

4. **Update buildspec.yml:**
   Add this before the build phase:
   ```yaml
   - echo "Logging in to Docker Hub..."
   - echo $DOCKERHUB_PASSWORD | docker login --username $DOCKERHUB_USERNAME --password-stdin
   ```

**Note:** Option 1 (ECR Public Gallery) is recommended because it's simpler and has no rate limits!

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

