# Upgrading from Nautobot v1.X

## Dependency Changes

- Nautobot no longer uses or supports the use of `django-cryptography`.
- Nautobot no longer uses or supports the use of `django-mptt`.
- Nautobot no longer uses or supports the use of `django-rq`.

## Database (ORM) Changes

### Database Field Behavior Changes

Most of the database field behavior changes in Nautobot 2.0 fall into the following general categories:

1. The `created` field on models has changed from a date only ("2023-04-06") to being a date/time ("2023-04-06T19:57:45.320232Z")
2. Various models that had a required `site` field and an optional `location` field now have a required `location` field.

??? info "Full table of database field behavior changes"
    {data-table installation/tables/v2-database-behavior-changes.yaml}

### Renamed Database Fields

Most renamed database fields in Nautobot 2.0 fall into the following general categories:

1. Renaming of foreign keys and reverse relations to more consistently and specifically match the related model name or plural name (for example, `Circuit.terminations` to `Circuit.circuit_terminations`, `Rack.group` to `Rack.rack_group`)
2. Renaming of tree model fields for consistency and due to the change from `django-mptt` to `django-tree-queries` (for example, `InventoryItem.child_items` to `InventoryItem.children` and `InventoryItem.level` to `InventoryItem.tree_depth`)

??? info "Full table of renamed database fields"
    {data-table installation/tables/v2-database-renamed-fields.yaml}

### Removed Database Fields

Most removed database fields in Nautobot 2.0 fall into the following general categories:

1. Removal of references to removed models such as `Site` and `Region`
2. Removal of `slug` fields in preference to the use of autogenerated natural-key slugs.
3. Removal of `django-mptt` internal fields (`lft`, `rght`, `tree_id`)

??? info "Full table of removed database fields"
    {data-table installation/tables/v2-database-removed-fields.yaml}

### Replaced Models

#### Generic Role Model

The `ipam.Role`, `dcim.RackRole`, and `dcim.DeviceRole` models have been removed and replaced by a single `extras.Role` model. This means that any references to the removed models in the code now use the `extras.Role` model instead.

| Removed Model     | Replaced With  |
|-------------------|----------------|
| `dcim.DeviceRole` | `extras.Role`  |
| `dcim.RackRole`   | `extras.Role`  |
| `ipam.Role`       | `extras.Role`  |

#### Site and Region Models

The `dcim.Region` and `dcim.Site` models have been removed and replaced by `dcim.Location` model. This means that any references to the removed models in the code now use the `dcim.Location` model instead with `LocationType` "Site" and "Region".

!!! important
    If you are a Nautobot App developer, or have any Apps installed that include data models that reference `Site` or `Region`, please review the [Region and Site Related Data Model Migration Guide](../installation/region-and-site-data-migration-guide.md#region-and-site-related-data-model-migration-guide-for-existing-nautobot-app-installations) to learn how to migrate your apps and models from `Site` and `Region` to `Location`.

| Removed Model     | Replaced With  |
|-------------------|----------------|
| `dcim.Region`     | `dcim.Location`|
| `dcim.Site`       | `dcim.Location`|

#### Aggregate Migrated to Prefix

The `ipam.Aggregate` model has been removed and all existing Aggregates will be migrated to `ipam.Prefix` records with their `type` set to "Container". The `Aggregate.date_added` field will be migrated to `Prefix.date_allocated` and changed from a Date field to a DateTime field with the time set to `00:00` UTC. `Aggregate.tenant`, `Aggregate.rir` and `Aggregate.description` will be migrated over to the equivalent fields on the new `Prefix`. ObjectChanges, Tags, Notes, Permissions, Custom Fields, Custom Links, Computed Fields and Relationships will be migrated to relate to the new `Prefix` as well.

If a `Prefix` already exists with the same network and prefix length as a previous `Aggregate`, the `rir` and `date_added` fields will be copied to the `rir` and `date_allocated` fields on the existing Prefix object. Messages will be output during migration (`nautobot-server migrate` or `nautobot-server post_upgrade`) if the `tenant`, `description` or `type` fields need to be manually migrated.

| Aggregate        | Prefix               |
|------------------|----------------------|
| `broadcast`      | `broadcast`          |
| **`date_added`** | **`date_allocated`** |
| `description`    | `description`        |
| `network`        | `network`            |
| `prefix_length`  | `prefix_length`      |
| `rir`            | `rir`                |
| `tenant`         | `tenant`             |

## GraphQL and REST API Changes

### API Behavior Changes

Most of the API behavior changes in Nautobot 2.0 fall into the following general categories:

1. The `created` field on most models has changed from a date only ("2023-04-06") to being a date/time ("2023-04-06T19:57:45.320232Z")
2. The `status` fields on various models has changed from a pseudo-enum value (containing a "value" and a "label") to referencing the related Status object in full, similar to other foreign-key fields.
3. Various models that had a required `site` field and an optional `location` field now have a required `location` field.

??? info "Full table of API behavior changes"
    {data-table installation/tables/v2-api-behavior-changes.yaml}

### Renamed Serializer Fields

Most renamed API fields in Nautobot 2.0 fall into the following general categories:

1. Renaming of foreign keys and reverse relations to more consistently and specifically match the related model name or plural name (for example, `Circuit.type` to `Circuit.circuit_type`, `Interface.count_ipaddresses` to `Interface.ip_address_count`)
2. Renaming of tree model fields for consistency and due to the change from `django-mptt` to `django-tree-queries` (for example, `InventoryItem._depth` to `InventoryItem.tree_depth`)

??? info "Full table of renamed API fields"
    {data-table installation/tables/v2-api-renamed-fields.yaml}

### Removed Serializer Fields

Most removed database fields in Nautobot 2.0 fall into the following general categories:

1. Removal of references to removed models such as `Site` and `Region`
2. Removal of `slug` fields in preference to the use of autogenerated natural-key slugs.

??? info "Full table of removed API fields"
    {data-table installation/tables/v2-api-removed-fields.yaml}

### Removed 1.X Version Endpoints and Serializer Representations

Nautobot 2.0 removes support for 1.X versioned REST APIs and their Serializers. Requesting [older API versions](../rest-api/overview.md#versioning) will result in a `400 Bad Request` error.

Please ensure you are using the latest representations of request/response representations as seen in the API docs or Swagger.

### Replaced Endpoints

These endpoints `/ipam/roles/`, `/dcim/rack-roles/` and `/dcim/device-roles/` are no longer available. Instead,  use the `/extras/roles/` endpoint to retrieve and manipulate `role` data.

| Removed Endpoints     | Replaced With    |
|-----------------------|------------------|
| `/dcim/device-roles/` | `/extras/roles/` |
| `/dcim/rack-roles/`   | `/extras/roles/` |
| `/ipam/roles/`        | `/extras/roles/` |

### API Query Parameters Changes

Nautobot 2.0 removes the `?brief` query parameter and adds support for the `?depth` query parameter. As a result, the ability to specify `brief_mode` in `DynamicModelChoiceField`, `DynamicModelMultipleChoiceField`, and `MultiMatchModelMultipleChoiceField` has also been removed. For every occurrence of the aforementioned fields where you have `brief_mode` set to `True/False` (e.g. `brief_mode=True`), please remove the statement, leaving other occurrences of the fields where you do not have `brief_mode` specified as they are.
Please see the [documentation on the `?depth` query parameter](../rest-api/overview.md/#depth-query-parameter) for more information.

## UI, GraphQL, and REST API Filter Changes

### Removed Changelog URL from View Context

`changelog_url` is no longer provided in the `ObjectView` context. To get a model instance's changelog URL, you can retrieve it from the instance itself if it supports it: `model_instance.get_changelog_url()`.

### Renamed Filter Fields

Most renamed filter fields in Nautobot 2.0 fall into the following general categories:

1. The `tag` filter is renamed to `tags` on all models supporting Tags.
2. Renames to match renamed model/serializer fields as described earlier in this document.
3. Related membership filters are renamed to `has_<related>` throughout, for example `ConsolePort.cabled` is renamed to `ConsolePort.has_cable`.
4. Most `<related>_id` filters have been merged into the corresponding `<related>` filter (see ["Enhanced Filter Fields"](#enhanced-filter-fields) below).

??? info "Full table of renamed filter fields"
    {data-table installation/tables/v2-filters-renamed-fields.yaml}

### Enhanced Filter Fields

Below is a table documenting [enhanced filter field changes](../release-notes/version-2.0.md#enhanced-filter-fields-2804) in Nautobot 2.0. These enhancements mostly fall into the following general categories:

1. Many filters are enhanced to permit filtering by UUID _or_ by name.
2. Filters that previously only supported a single filter value can now filter on multiple values.

??? info "Full table of enhanced filter fields"
    {data-table installation/tables/v2-filters-enhanced-fields.yaml}

### Corrected Filter Fields

Below is a table documenting [corrected filter field changes](../release-notes/version-2.0.md#corrected-filter-fields-2804) in Nautobot 2.0. These corrections mostly involve filters that previously permitted filtering on related membership only (`/api/dcim/devices/?console_ports=True`) and have now been corrected into filters for related membership (`/api/dcim/devices/?has_console_ports=True`) as well as by actual related objects (`/api/dcim/devices/?console_ports=<UUID>`).

??? info "Full table of corrected filter fields"
    {data-table installation/tables/v2-filters-corrected-fields.yaml}

### Removed Filter Fields

Below is a table documenting [removed filter field changes](../release-notes/version-2.0.md#removed-filter-fields-2804) in v2.x.
Most removed database fields in Nautobot 2.0 fall into the following general categories:

1. Removal of `*_id=<uuid>` filters as they have have been merged into filters that support both uuid and name/slug (for example, instead of `/api/circuits/circuits/?provider_id=<UUID>`, use `/api/circuits/circuits/?provider=<uuid>`).
2. Removal of filtering on removed models such as `Region` and `Site`. (Use `location` filters instead.)
3. Removal of `slug` filters from models that no longer have a `slug` field.

??? info "Full table of removed filter fields"
    {data-table installation/tables/v2-filters-removed-fields.yaml}

## Python Code Location Changes

The below is mostly relevant only to authors of Jobs and Nautobot Apps. End users should not be impacted by the changes in this section. Most changes in code location arise from the merging of the `nautobot.utilities` module into the `nautobot.core` module.

??? info "Full table of code location changes"
    {data-table installation/tables/v2-code-location-changes.yaml}

## Removed Python Code

Because of the replacement of the `?brief` REST API query parameter with `?depth` and the removal of all `Nested*Serializers`, some of the classes and mixins are removed because they are no longer needed.

??? info "Full table of code removals"
    {data-table installation/tables/v2-code-removals.yaml}

## Git Data Source Changes

The Configuration Contexts Metadata key `schema` has been replaced with `config_context_schema`. This means that any `schema` references in your git repository's data must be updated to reflect this change.

## Logging Changes

Where applicable, `logging.getLogger("some_arbitrary_name")` is replaced with `logging.getLogger(__name__)` or `logging.getLogger(__name__ + ".SpecificFeature")`.

Below is a table documenting changes in logger names that could potentially affect existing deployments with expectations around specific logger names used for specific purposes.

??? info "Full table of logger name changes"
    {data-table installation/tables/v2-logging-renamed-loggers.yaml}

## Job Database Model Changes

The Job `name` field has been changed to a unique field and the `name` + `grouping` uniqueness constraint has been removed. The processes that refresh jobs (`nautobot-server post_upgrade` and `nautobot-server migrate`) have been updated to gracefully handle duplicate job names.

!!! example
    ```py
    class NautobotJob1(Job):
        class Meta:
            name = "Sample job"

    class NautobotJob2(Job):
        class Meta:
            name = "Sample job"
    ```

    These jobs would be named `Sample job` and `Sample job (2)`

The Job `slug` has been updated to be derived from the `name` field instead of a combination of `job_source`, `git_repository`, and `job_class`.

!!! example
    The Nautobot Golden Config backup job's slug will change from `plugins-nautobot_golden_config-jobs-backupjob` to `backup-configurations`.