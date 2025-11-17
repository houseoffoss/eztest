export class ProjectMessages {
  static ProjectCreatedSuccessfully = 'Project created successfully.';
  static ProjectsFetchedSuccessfully = 'Projects fetched successfully.';
  static ProjectFetchedSuccessfully = 'Project fetched successfully.';
  static ProjectUpdatedSuccessfully = 'Project updated successfully.';
  static ProjectDeletedSuccessfully = 'Project deleted successfully.';
  static ProjectNotFound = 'Project not found.';
  static ProjectKeyAlreadyExists = 'Project key already exists.';
  static NameAndKeyRequired = 'Name and key are required.';
  static InvalidNameLength = 'Name must be between 3 and 255 characters.';
  static InvalidKeyLength = 'Key must be between 2 and 10 characters.';
  static InvalidKeyFormat = 'Key can only contain letters and numbers.';
  static FailedToCreateProject = 'Failed to create project.';
  static FailedToUpdateProject = 'Failed to update project.';
  static FailedToDeleteProject = 'Failed to delete project.';
}

export class ProjectMemberMessages {
  static MemberAddedSuccessfully = 'Member added successfully.';
  static MemberRemovedSuccessfully = 'Member removed successfully.';
  static MembersFetchedSuccessfully = 'Members fetched successfully.';
  static EmailOrUserIdRequired = 'Either email or userId is required.';
  static InvalidRole = 'Invalid role. Must be one of: OWNER, ADMIN, TESTER, VIEWER.';
  static UserAlreadyMember = 'User is already a member of this project.';
  static UserNotFound = 'User not found.';
  static UserWithEmailNotFound = 'User with this email not found.';
  static MemberNotFound = 'Member not found in this project.';
  static CannotRemoveLastOwner = 'Cannot remove the last owner of the project.';
  static FailedToAddMember = 'Failed to add member to project.';
  static FailedToRemoveMember = 'Failed to remove member from project.';
}

export class TestCaseMessages {
  static TestCaseCreatedSuccessfully = 'Test case created successfully.';
  static TestCasesFetchedSuccessfully = 'Test cases fetched successfully.';
  static TestCaseFetchedSuccessfully = 'Test case fetched successfully.';
  static TestCaseUpdatedSuccessfully = 'Test case updated successfully.';
  static TestCaseDeletedSuccessfully = 'Test case deleted successfully.';
  static TestCaseNotFound = 'Test case not found.';
  static TestStepsUpdatedSuccessfully = 'Test steps updated successfully.';
  static TestCaseStatsFetchedSuccessfully = 'Test case statistics fetched successfully.';
  static TitleRequired = 'Title is required.';
  static TitleCannotBeEmpty = 'Title cannot be empty.';
  static InvalidPriority = 'Invalid priority value.';
  static InvalidStatus = 'Invalid status value.';
  static InvalidEstimatedTime = 'Estimated time must be a positive number.';
  static StepsMustBeArray = 'Steps must be an array.';
  static InvalidStepFormat = 'Each step must have an action and expected result.';
  static InvalidStepNumber = 'Step numbers must be positive integers.';
  static FailedToFetchTestCase = 'Failed to fetch test case.';
  static FailedToUpdateTestCase = 'Failed to update test case.';
  static FailedToDeleteTestCase = 'Failed to delete test case.';
  static FailedToUpdateTestSteps = 'Failed to update test steps.';
}

export class AuthMessages {
  static UserSignedInSuccessfully = 'User signed in successfully.';
  static LoginSuccessful = 'Login successful.';
  static EmailAlreadyRegistered = 'This email is already registered.';
  static InvalidPassword = 'Invalid password.';
  static PasswordResetCodeSentSuccessfully = 'Password reset code sent successfully.';
  static PasswordChangedSuccessfully = 'Password changed successfully.';
  static ResetPasswordFailed = 'Reset password failed.';
  static ResetPasswordCodeSentFailed = 'Reset password code sent failed.';
}

export class UserMessages {
  static UserFetchedSuccessfully = 'User fetched successfully.';
  static UserUpdatedSuccessfully = 'User updated successfully.';
  static UserNotFound = 'User not found.';
  static FetchUserDetailsFailed = 'Unable to fetch the user details.';
  static UpdateUserFailed = 'Unable to update the user.';
  static MissingClientCredentials = 'Missing client credentials.';
  static FetchAccessTokenFailed = 'Failed to fetch access token.';
}

export class AuthorizationMessages {
  static PrivilegesFetchedSuccessfully = 'Privileges fetched successfully.';
  static RoleNotFound = 'Role not found.';
  static MenuListFetchedSuccessfully = 'Menu list fetched successfully.';
  static AccessListFetchedSuccessfully = 'Access list fetched successfully.';
  static NotAuthorized = 'You are not authorized to access this resource.';
  static InsufficientPermissions = 'You do not have sufficient permissions to perform this action.';
}

export class GeneralMessages {
  static OperationSuccessful = 'Operation completed successfully.';
  static OperationFailed = 'Operation failed.';
  static InvalidRequest = 'Invalid request.';
  static InternalServerError = 'Internal server error.';
  static ResourceNotFound = 'Resource not found.';
  static BadRequest = 'Bad request.';
  static Unauthorized = 'Unauthorized access.';
  static Forbidden = 'Access forbidden.';
}
