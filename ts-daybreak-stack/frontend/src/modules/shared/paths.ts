
const paths = {
	issueListPage: (projectID: string, issueList: string) => `/list/${projectID}/${issueList}`,
	newIssuePage: (projectID: string, issueList: string) => `/list/${projectID}/${issueList}/new`,
	issuePage: (projectID: string, listID: string, issueID: string) => `/issue/${projectID}/${listID}/${issueID}`,
	projectsPickerPage: () => '/projects',
	allIssueListsPage: (projectID: string) => `/lists/${projectID}`
}

export default paths
