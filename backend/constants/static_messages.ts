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
  static TestCasesExportedSuccessfully = 'Test cases exported successfully.';
  static FailedToExportTestCases = 'Failed to export test cases.';
  static InvalidExportFormat = 'Invalid export format. Use "csv" or "excel".';
}

export class ModuleMessages {
  static ModuleCreatedSuccessfully = 'Module created successfully.';
  static ModulesFetchedSuccessfully = 'Modules fetched successfully.';
  static ModuleFetchedSuccessfully = 'Module fetched successfully.';
  static ModuleUpdatedSuccessfully = 'Module updated successfully.';
  static ModuleDeletedSuccessfully = 'Module deleted successfully.';
  static ModuleNotFound = 'Module not found.';
  static ModulesReorderedSuccessfully = 'Modules reordered successfully.';
  static NameRequired = 'Module name is required.';
  static NameCannotBeEmpty = 'Module name cannot be empty.';
  static NameAlreadyExists = 'A module with this name already exists in this project.';
  static ModuleNameAlreadyExists = 'A module with this name already exists in this project.';
  static InvalidModuleOrder = 'Invalid module order configuration.';
  static ModuleContainsTestCases = 'Cannot delete module with associated test cases.';
  static CannotDeleteModuleWithTestCases = 'Cannot delete module with associated test cases.';
  static FailedToCreateModule = 'Failed to create module.';
  static FailedToUpdateModule = 'Failed to update module.';
  static FailedToDeleteModule = 'Failed to delete module.';
  static FailedToReorderModules = 'Failed to reorder modules.';
  static FailedToFetchModules = 'Failed to fetch modules.';
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
  static UserCreatedSuccessfully = 'User created successfully.';
  static PasswordResetInstructionsSent = 'Password reset instructions have been sent to your email.';
  static PasswordResetSuccessfully = 'Password has been reset successfully. You can now login with your new password.';
  static UserAlreadyExists = 'User with this email already exists.';
  static CurrentPasswordIncorrect = 'Current password is incorrect.';
  static NewPasswordMustBeDifferent = 'New password must be different from current password.';
}

export class EmailMessages {
  static EmailServiceConfigured = 'Email service is configured and ready.';
  static EmailServiceNotConfigured = 'Email service is not configured. Please set SMTP environment variables.';
  static EmailSentSuccessfully = 'Email sent successfully.';
  static EmailSendFailed = 'Failed to send email.';
}

export class DefectMessages {
  static DefectCreatedSuccessfully = 'Defect created successfully.';
  static DefectsFetchedSuccessfully = 'Defects fetched successfully.';
  static DefectFetchedSuccessfully = 'Defect fetched successfully.';
  static DefectUpdatedSuccessfully = 'Defect updated successfully.';
  static DefectDeletedSuccessfully = 'Defect deleted successfully.';
  static DefectLinkedSuccessfully = 'Defect linked successfully.';
  static DefectUnlinkedSuccessfully = 'Defect unlinked successfully.';
  static DefectNotFound = 'Defect not found.';
  static DefectAssignmentEmailSent = 'Defect assignment email sent successfully.';
  static FailedToCreateDefect = 'Failed to create defect.';
  static FailedToUpdateDefect = 'Failed to update defect.';
  static FailedToDeleteDefect = 'Failed to delete defect.';
  static FailedToLinkDefect = 'Failed to link defect.';
  static FailedToUnlinkDefect = 'Failed to unlink defect.';
  static DefectsExportedSuccessfully = 'Defects exported successfully.';
  static FailedToExportDefects = 'Failed to export defects.';
}

export class UserMessages {
  static UserFetchedSuccessfully = 'User fetched successfully.';
  static UserUpdatedSuccessfully = 'User updated successfully.';
  static UserDeletedSuccessfully = 'User deleted successfully.';
  static UserNotFound = 'User not found.';
  static FetchUserDetailsFailed = 'Unable to fetch the user details.';
  static UpdateUserFailed = 'Unable to update the user.';
  static MissingClientCredentials = 'Missing client credentials.';
  static FetchAccessTokenFailed = 'Failed to fetch access token.';
}

export class AuthorizationMessages {
  static PrivilegesFetchedSuccessfully = 'Privileges fetched successfully.';
  static RoleNotFound = 'Role not found.';
  static FailedToFetchRoles = 'Failed to fetch roles.';
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

export class TestSuiteMessages {
  static TestSuitesFetchedSuccessfully = 'Test suites fetched successfully.';
  static TestSuiteFetchedSuccessfully = 'Test suite fetched successfully.';
  static TestSuiteCreatedSuccessfully = 'Test suite created successfully.';
  static TestSuiteUpdatedSuccessfully = 'Test suite updated successfully.';
  static TestSuiteDeletedSuccessfully = 'Test suite deleted successfully.';
  static TestSuitesReorderedSuccessfully = 'Test suites reordered successfully.';
  static TestCasesMovedSuccessfully = 'Test case(s) moved successfully.';
  static ModuleAddedToSuiteSuccessfully = 'Module added to suite successfully.';
  static ModuleUpdatedInSuiteSuccessfully = 'Module updated in suite successfully.';
  static ModuleRemovedFromSuiteSuccessfully = 'Module removed from suite successfully.';
  static TestSuiteNotFound = 'Test suite not found.';
  static SuiteNameRequired = 'Suite name is required.';
  static SuiteNameCannotBeEmpty = 'Suite name cannot be empty.';
  static InvalidSuiteParent = 'Invalid suite parent.';
  static ModuleNotFound = 'Module not found.';
  static ModuleIDRequired = 'Module ID is required.';
  static NewModuleIDRequired = 'New module ID is required.';
  static FailedToFetchTestSuite = 'Failed to fetch test suite.';
  static FailedToCreateTestSuite = 'Failed to create test suite.';
  static FailedToUpdateTestSuite = 'Failed to update test suite.';
  static FailedToDeleteTestSuite = 'Failed to delete test suite.';
  static FailedToMoveTestCases = 'Failed to move test cases.';
  static FailedToReorderTestSuites = 'Failed to reorder test suites.';
  static FailedToAddModuleToSuite = 'Failed to add module to suite.';
  static FailedToUpdateModuleInSuite = 'Failed to update module in suite.';
  static FailedToRemoveModuleFromSuite = 'Failed to remove module from suite.';
  static TestCasesAddedToSuiteSuccessfully = 'Test cases added to suite successfully.';
  static TestCasesRemovedFromSuiteSuccessfully = 'Test cases removed from suite successfully.';
  static TestCasesCheckedSuccessfully = 'Test cases checked successfully.';
  static TestCaseIDsRequired = 'Test case IDs are required.';
  static FailedToAddTestCasesToSuite = 'Failed to add test cases to suite.';
  static FailedToRemoveTestCasesFromSuite = 'Failed to remove test cases from suite.';
  static FailedToCheckTestCasesInSuite = 'Failed to check test cases in suite.';
  static AccessDeniedTestSuite = 'Access denied. Only project owners and admins can manage test suites.';
}

export class TestRunMessages {
  static TestRunsFetchedSuccessfully = 'Test runs fetched successfully.';
  static TestRunFetchedSuccessfully = 'Test run fetched successfully.';
  static TestRunCreatedSuccessfully = 'Test run created successfully.';
  static TestRunUpdatedSuccessfully = 'Test run updated successfully.';
  static TestRunDeletedSuccessfully = 'Test run deleted successfully.';
  static TestRunStartedSuccessfully = 'Test run started successfully.';
  static TestRunCompletedSuccessfully = 'Test run completed successfully.';
  static TestRunReportSentSuccessfully = 'Test run report sent successfully.';
  static TestRunNotFound = 'Test run not found.';
  static TestRunNameRequired = 'Test run name is required.';
  static TestRunNameCannotBeEmpty = 'Test run name cannot be empty.';
  static InvalidTestRunStatus = 'Invalid test run status.';
  static NoTestCases = 'No test cases provided.';
  static NoRecipientsFound = 'No recipients found to send report to.';
  static NoValidEmailAddresses = 'No recipients with valid email addresses found.';
  static FailedToFetchTestRun = 'Failed to fetch test run.';
  static FailedToCreateTestRun = 'Failed to create test run.';
  static FailedToUpdateTestRun = 'Failed to update test run.';
  static FailedToDeleteTestRun = 'Failed to delete test run.';
  static FailedToStartTestRun = 'Failed to start test run.';
  static FailedToCompleteTestRun = 'Failed to complete test run.';
  static FailedToSendTestRunReport = 'Failed to send test run report.';
  static AccessDeniedTestRun = 'Access denied. Only project owners/admins can manage test runs.';
  static TestRunsExportedSuccessfully = 'Test runs exported successfully.';
  static FailedToExportTestRuns = 'Failed to export test runs.';
}
