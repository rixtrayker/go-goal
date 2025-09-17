package graphql

import "database/sql"

type Resolver struct {
	DB *sql.DB
}
